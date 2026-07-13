# Data Model

These are target entities for future Supabase or backend implementation. They are not implemented yet.

## User

- `id`
- `email`
- `username`
- `display_name`
- `avatar_url`
- `created_at`
- `updated_at`
- `last_login_at`
- `role`
- `status`

## Toy

- `id`
- `slug`
- `name`
- `short_description`
- `description`
- `series_id`
- `rarity_id`
- `model_url`
- `poster_url`
- `thumbnail_url`
- `model_version`
- `status`
- `release_date`
- `created_at`
- `updated_at`

## Series

- `id`
- `slug`
- `name`
- `description`
- `cover_image_url`
- `status`
- `sort_order`

## Rarity

- `id`
- `code`
- `name`
- `level`
- `probability_weight`
- `visual_effect_key`
- `sort_order`

## UserCollection

- `id`
- `user_id`
- `toy_id`
- `quantity`
- `first_obtained_at`
- `latest_obtained_at`
- `source_type`

## DrawPool

- `id`
- `name`
- `description`
- `cover_image_url`
- `start_at`
- `end_at`
- `status`
- `draw_cost`
- `guarantee_rule`

## DrawPoolItem

- `id`
- `pool_id`
- `toy_id`
- `weight`
- `probability`
- `is_featured`

## DrawRecord

- `id`
- `user_id`
- `pool_id`
- `toy_id`
- `draw_batch_id`
- `draw_type`
- `created_at`

## UserCurrency

- `user_id`
- `currency_type`
- `balance`
- `updated_at`

## Security Notes

- User collection rows must be user-scoped.
- Draw records and currency changes should be created by trusted backend logic.
- Admin-only entities need server-side authorization, not frontend hiding.

