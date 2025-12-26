# Airflow DAG Reference
# Complete ETL pipeline with sensors, task groups, and quality checks

from datetime import datetime, timedelta
from airflow import DAG
from airflow.operators.python import PythonOperator
from airflow.providers.apache.spark.operators.spark_submit import SparkSubmitOperator
from airflow.providers.dbt.cloud.operators.dbt import DbtCloudRunJobOperator
from airflow.sensors.external_task import ExternalTaskSensor
from airflow.utils.task_group import TaskGroup

default_args = {
    'owner': 'data-engineering',
    'depends_on_past': False,
    'email_on_failure': True,
    'email': ['data-alerts@company.com'],
    'retries': 3,
    'retry_delay': timedelta(minutes=5),
    'retry_exponential_backoff': True,
    'max_retry_delay': timedelta(minutes=30),
}

with DAG(
    dag_id='etl_orders_pipeline',
    default_args=default_args,
    description='Daily orders ETL pipeline',
    schedule_interval='0 6 * * *',  # 6 AM daily
    start_date=datetime(2024, 1, 1),
    catchup=False,
    max_active_runs=1,
    tags=['etl', 'orders', 'production'],
) as dag:

    # Wait for upstream data
    wait_for_source = ExternalTaskSensor(
        task_id='wait_for_source_data',
        external_dag_id='source_system_export',
        external_task_id='export_complete',
        timeout=3600,
        poke_interval=60,
        mode='reschedule',
    )

    # Extract and load to bronze
    with TaskGroup(group_id='extract_load') as extract_load:
        extract_orders = SparkSubmitOperator(
            task_id='extract_orders',
            application='/opt/spark/jobs/extract_orders.py',
            conn_id='spark_default',
            conf={
                'spark.sql.shuffle.partitions': '200',
                'spark.dynamicAllocation.enabled': 'true',
            },
            application_args=[
                '--date', '{{ ds }}',
                '--source', 's3://source-bucket/orders/',
                '--target', 's3://bronze-bucket/orders/',
            ],
        )

        extract_customers = SparkSubmitOperator(
            task_id='extract_customers',
            application='/opt/spark/jobs/extract_customers.py',
            conn_id='spark_default',
            application_args=[
                '--date', '{{ ds }}',
                '--source', 's3://source-bucket/customers/',
                '--target', 's3://bronze-bucket/customers/',
            ],
        )

    # Data quality checks on bronze
    def run_bronze_quality_checks(**context):
        from great_expectations.data_context import DataContext

        ge_context = DataContext('/opt/great_expectations')
        result = ge_context.run_checkpoint(
            checkpoint_name='bronze_orders_checkpoint',
            batch_request={
                'datasource_name': 's3_bronze',
                'data_asset_name': 'orders',
                'data_connector_query': {
                    'batch_filter_parameters': {
                        'date': context['ds']
                    }
                }
            }
        )
        if not result.success:
            raise ValueError('Bronze data quality checks failed')

    bronze_quality = PythonOperator(
        task_id='bronze_quality_checks',
        python_callable=run_bronze_quality_checks,
    )

    # Transform with dbt (bronze → silver → gold)
    dbt_run = DbtCloudRunJobOperator(
        task_id='dbt_transform',
        job_id=12345,
        check_interval=30,
        timeout=7200,
        wait_for_termination=True,
    )

    # Gold layer quality checks
    gold_quality = PythonOperator(
        task_id='gold_quality_checks',
        python_callable=lambda: print('Running gold quality checks'),
    )

    # Notify downstream
    def notify_completion(**context):
        # Send Slack notification, update data catalog, etc.
        pass

    notify = PythonOperator(
        task_id='notify_completion',
        python_callable=notify_completion,
    )

    # DAG dependencies
    wait_for_source >> extract_load >> bronze_quality >> dbt_run >> gold_quality >> notify
