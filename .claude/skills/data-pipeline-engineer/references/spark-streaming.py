# Spark Streaming Reference
# Complete Kafka-to-Delta Lake streaming processor with windowing

from pyspark.sql import SparkSession
from pyspark.sql.functions import (
    from_json, col, window, sum as spark_sum,
    count, avg, expr, current_timestamp
)
from pyspark.sql.types import (
    StructType, StructField, StringType,
    DoubleType, TimestampType, IntegerType
)

spark = SparkSession.builder \
    .appName("OrderStreamProcessor") \
    .config("spark.sql.streaming.checkpointLocation", "s3://checkpoints/orders") \
    .getOrCreate()

# Define schema for incoming events
order_schema = StructType([
    StructField("order_id", StringType(), False),
    StructField("customer_id", StringType(), False),
    StructField("product_id", StringType(), False),
    StructField("quantity", IntegerType(), False),
    StructField("unit_price", DoubleType(), False),
    StructField("event_time", TimestampType(), False),
])

# Read from Kafka
orders_stream = spark \
    .readStream \
    .format("kafka") \
    .option("kafka.bootstrap.servers", "kafka:9092") \
    .option("subscribe", "orders") \
    .option("startingOffsets", "latest") \
    .option("failOnDataLoss", "false") \
    .load()

# Parse JSON and apply schema
parsed_orders = orders_stream \
    .select(from_json(col("value").cast("string"), order_schema).alias("data")) \
    .select("data.*") \
    .withColumn("total_amount", col("quantity") * col("unit_price")) \
    .withWatermark("event_time", "10 minutes")

# Aggregate by 5-minute windows
windowed_metrics = parsed_orders \
    .groupBy(
        window(col("event_time"), "5 minutes", "1 minute"),
        col("product_id")
    ) \
    .agg(
        count("order_id").alias("order_count"),
        spark_sum("quantity").alias("total_quantity"),
        spark_sum("total_amount").alias("total_revenue"),
        avg("total_amount").alias("avg_order_value")
    ) \
    .select(
        col("window.start").alias("window_start"),
        col("window.end").alias("window_end"),
        "product_id",
        "order_count",
        "total_quantity",
        "total_revenue",
        "avg_order_value",
        current_timestamp().alias("processed_at")
    )

# Write to Delta Lake
query = windowed_metrics \
    .writeStream \
    .format("delta") \
    .outputMode("append") \
    .option("checkpointLocation", "s3://checkpoints/metrics") \
    .option("mergeSchema", "true") \
    .trigger(processingTime="30 seconds") \
    .start("s3://gold-bucket/order_metrics")

# Also write to Kafka for real-time dashboards
kafka_query = windowed_metrics \
    .selectExpr("to_json(struct(*)) as value") \
    .writeStream \
    .format("kafka") \
    .option("kafka.bootstrap.servers", "kafka:9092") \
    .option("topic", "order_metrics") \
    .option("checkpointLocation", "s3://checkpoints/kafka-metrics") \
    .start()

spark.streams.awaitAnyTermination()
