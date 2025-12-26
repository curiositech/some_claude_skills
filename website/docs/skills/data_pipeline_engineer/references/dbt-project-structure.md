---
title: dbt Project Structure Reference
sidebar_label: dbt Project Structure Refer...
sidebar_position: 1
---
# dbt Project Structure Reference
# Complete project layout with staging, intermediate, and marts layers

```
dbt_project/
├── dbt_project.yml
├── profiles.yml
├── models/
│   ├── staging/           # Bronze → Silver
│   │   ├── _staging.yml
│   │   ├── stg_orders.sql
│   │   ├── stg_customers.sql
│   │   └── stg_products.sql
│   ├── intermediate/      # Business logic
│   │   ├── _intermediate.yml
│   │   ├── int_orders_enriched.sql
│   │   └── int_customer_orders.sql
│   └── marts/             # Gold layer
│       ├── core/
│       │   ├── _core.yml
│       │   ├── dim_customers.sql
│       │   ├── dim_products.sql
│       │   └── fct_orders.sql
│       └── marketing/
│           ├── _marketing.yml
│           └── mrt_customer_ltv.sql
├── tests/
│   ├── generic/
│   │   └── test_positive_value.sql
│   └── singular/
│       └── assert_total_revenue_positive.sql
├── macros/
│   ├── generate_schema_name.sql
│   └── cents_to_dollars.sql
├── seeds/
│   └── country_codes.csv
└── snapshots/
    └── snap_customers.sql
```

## Staging Model Example

```sql
-- models/staging/stg_orders.sql
{{
  config(
    materialized='incremental',
    unique_key='order_id',
    partition_by={
      "field": "order_date",
      "data_type": "date",
      "granularity": "day"
    }
  )
}}

with source as (
    select * from {{ source('raw', 'orders') }}
    {% if is_incremental() %}
    where _loaded_at > (select max(_loaded_at) from {{ this }})
    {% endif %}
),

cleaned as (
    select
        order_id,
        customer_id,
        cast(order_date as date) as order_date,
        cast(total_cents as numeric) / 100 as total_amount,
        status,
        _loaded_at
    from source
    where order_id is not null
)

select * from cleaned
```

## Fact Table Example

```sql
-- models/marts/core/fct_orders.sql
{{
  config(
    materialized='table',
    cluster_by=['customer_id', 'order_date']
  )
}}

with orders as (
    select * from {{ ref('stg_orders') }}
),

customers as (
    select * from {{ ref('dim_customers') }}
),

products as (
    select * from {{ ref('int_order_items_enriched') }}
),

final as (
    select
        o.order_id,
        o.order_date,
        c.customer_key,
        c.customer_segment,
        p.total_items,
        p.total_quantity,
        o.total_amount,
        o.status,
        datediff('day', c.first_order_date, o.order_date) as days_since_first_order,
        row_number() over (
            partition by o.customer_id
            order by o.order_date
        ) as order_sequence_number
    from orders o
    left join customers c on o.customer_id = c.customer_id
    left join products p on o.order_id = p.order_id
)

select * from final
```

## Schema YAML Example

```yaml
# models/staging/_staging.yml
version: 2

models:
  - name: stg_orders
    description: Cleaned orders from source system
    columns:
      - name: order_id
        description: Primary key
        tests:
          - unique
          - not_null
      - name: customer_id
        tests:
          - not_null
          - relationships:
              to: ref('stg_customers')
              field: customer_id
      - name: total_amount
        tests:
          - not_null
          - dbt_utils.accepted_range:
              min_value: 0
              max_value: 100000
```
