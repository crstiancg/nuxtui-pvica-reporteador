ALTER TABLE `reporte_items`
    MODIFY COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) AFTER `eca_turbiedad`,
    MODIFY COLUMN `updated_at` DATETIME(3) NOT NULL AFTER `created_at`;
