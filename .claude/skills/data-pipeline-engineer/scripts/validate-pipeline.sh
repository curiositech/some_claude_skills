#!/bin/bash
# Data Pipeline Engineer Skill Validation Script
# Validates data pipeline configurations for best practices

set -e

ERRORS=0
WARNINGS=0

echo "═══════════════════════════════════════════════════════════════"
echo "Data Pipeline Engineer Skill Validator"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Check dbt project
check_dbt() {
    echo "📊 Checking dbt project..."

    if [ -f "dbt_project.yml" ]; then
        echo "  Found dbt_project.yml"

        # Check for version
        if ! grep -q "version:" dbt_project.yml 2>/dev/null; then
            echo "⚠️  WARN: dbt_project.yml missing version"
            ((WARNINGS++))
        fi

        # Check for models directory
        if [ ! -d "models" ]; then
            echo "❌ ERROR: models/ directory not found"
            ((ERRORS++))
        fi

        # Check for staging layer
        if [ ! -d "models/staging" ]; then
            echo "⚠️  WARN: models/staging/ not found (recommended for medallion architecture)"
            ((WARNINGS++))
        fi

        # Check for marts layer
        if [ ! -d "models/marts" ]; then
            echo "⚠️  WARN: models/marts/ not found (recommended for gold layer)"
            ((WARNINGS++))
        fi

        # Check models for incremental config
        for model in models/**/*.sql; do
            [ -f "$model" ] || continue

            # Check if large tables are incremental
            if grep -q "materialized='table'" "$model" 2>/dev/null; then
                if ! grep -q "is_incremental" "$model" 2>/dev/null; then
                    echo "⚠️  WARN: $model uses table materialization but not incremental"
                    ((WARNINGS++))
                fi
            fi

            # Check for hardcoded dates
            if grep -qE "'202[0-9]-[0-9]{2}-[0-9]{2}'" "$model" 2>/dev/null; then
                echo "⚠️  WARN: $model contains hardcoded dates"
                ((WARNINGS++))
            fi
        done

        # Check for schema YAML files
        schema_files=$(find models -name "*.yml" 2>/dev/null | wc -l)
        if [ "$schema_files" -eq 0 ]; then
            echo "⚠️  WARN: No schema YAML files found (add tests and documentation)"
            ((WARNINGS++))
        fi
    else
        echo "ℹ️  No dbt project found"
    fi
}

# Check Airflow DAGs
check_airflow() {
    echo ""
    echo "🔄 Checking Airflow DAGs..."

    for dag in dags/*.py; do
        [ -f "$dag" ] || continue

        echo "  Checking: $dag"

        # Check for retries
        if ! grep -q "retries" "$dag" 2>/dev/null; then
            echo "⚠️  WARN: $dag missing retry configuration"
            ((WARNINGS++))
        fi

        # Check for catchup=False (usually desired)
        if grep -q "catchup=True" "$dag" 2>/dev/null; then
            echo "ℹ️  INFO: $dag has catchup=True (ensure this is intentional)"
        fi

        # Check for max_active_runs
        if ! grep -q "max_active_runs" "$dag" 2>/dev/null; then
            echo "⚠️  WARN: $dag missing max_active_runs (could cause parallel run issues)"
            ((WARNINGS++))
        fi

        # Check for email_on_failure
        if ! grep -q "email_on_failure" "$dag" 2>/dev/null; then
            echo "⚠️  WARN: $dag missing email_on_failure notification"
            ((WARNINGS++))
        fi

        # Check for hardcoded connections
        if grep -qE "host\s*=\s*['\"]" "$dag" 2>/dev/null; then
            echo "❌ ERROR: $dag contains hardcoded host (use Airflow connections)"
            ((ERRORS++))
        fi
    done
}

# Check Spark jobs
check_spark() {
    echo ""
    echo "⚡ Checking Spark jobs..."

    for spark_job in *.py spark/*.py jobs/*.py; do
        [ -f "$spark_job" ] || continue

        # Check if it's a Spark file
        if ! grep -q "SparkSession\|pyspark" "$spark_job" 2>/dev/null; then
            continue
        fi

        echo "  Checking: $spark_job"

        # Check for checkpoint location in streaming
        if grep -q "readStream\|writeStream" "$spark_job" 2>/dev/null; then
            if ! grep -q "checkpointLocation" "$spark_job" 2>/dev/null; then
                echo "❌ ERROR: $spark_job streaming job missing checkpointLocation"
                ((ERRORS++))
            fi
        fi

        # Check for watermark in streaming
        if grep -q "readStream" "$spark_job" 2>/dev/null; then
            if ! grep -q "withWatermark" "$spark_job" 2>/dev/null; then
                echo "⚠️  WARN: $spark_job streaming job missing watermark (may accumulate state)"
                ((WARNINGS++))
            fi
        fi

        # Check for shuffle partition tuning
        if grep -q "groupBy\|join" "$spark_job" 2>/dev/null; then
            if ! grep -q "shuffle.partitions" "$spark_job" 2>/dev/null; then
                echo "ℹ️  INFO: $spark_job may benefit from tuning spark.sql.shuffle.partitions"
            fi
        fi
    done
}

# Check data quality
check_data_quality() {
    echo ""
    echo "✅ Checking data quality setup..."

    # Check for Great Expectations
    if [ -d "great_expectations" ]; then
        echo "  Found Great Expectations configuration"

        if [ ! -d "great_expectations/expectations" ]; then
            echo "⚠️  WARN: No expectation suites found"
            ((WARNINGS++))
        fi

        if [ ! -d "great_expectations/checkpoints" ]; then
            echo "⚠️  WARN: No checkpoints configured"
            ((WARNINGS++))
        fi
    fi

    # Check for dbt tests
    if [ -f "dbt_project.yml" ]; then
        test_count=$(grep -r "tests:" models/ 2>/dev/null | wc -l)
        if [ "$test_count" -lt 5 ]; then
            echo "⚠️  WARN: Few dbt tests found (add schema tests)"
            ((WARNINGS++))
        fi
    fi
}

# Run all checks
check_dbt
check_airflow
check_spark
check_data_quality

# Summary
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "Validation Complete"
echo "═══════════════════════════════════════════════════════════════"
echo "Errors:   $ERRORS"
echo "Warnings: $WARNINGS"
echo ""

if [ $ERRORS -gt 0 ]; then
    echo "❌ Validation FAILED - fix errors before deployment"
    exit 1
elif [ $WARNINGS -gt 5 ]; then
    echo "⚠️  Validation PASSED with warnings - review recommended"
    exit 0
else
    echo "✅ Validation PASSED"
    exit 0
fi
