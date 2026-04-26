-- Create a new header table for unique periodo + centro combinations.
CREATE TABLE `reportes_new` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `periodo_id` INTEGER NOT NULL,
    `centro_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `reportes_periodo_id_centro_id_key`(`periodo_id`, `centro_id`),
    INDEX `reportes_periodo_id_idx`(`periodo_id`),
    INDEX `reportes_centro_id_idx`(`centro_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create the detail rows that preserve every medicion.
CREATE TABLE `reporte_items` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `reporte_id` INTEGER NOT NULL,
    `cloro` DOUBLE NOT NULL,
    `conductividad` DOUBLE NOT NULL,
    `ph` DOUBLE NOT NULL,
    `temperatura` DOUBLE NOT NULL,
    `turbiedad` DOUBLE NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `reporte_items_reporte_id_idx`(`reporte_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `reportes_new` ADD CONSTRAINT `reportes_new_periodo_id_fkey` FOREIGN KEY (`periodo_id`) REFERENCES `periodos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `reportes_new` ADD CONSTRAINT `reportes_new_centro_id_fkey` FOREIGN KEY (`centro_id`) REFERENCES `centros`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `reporte_items` ADD CONSTRAINT `reporte_items_reporte_id_fkey` FOREIGN KEY (`reporte_id`) REFERENCES `reportes_new`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- Migrate unique periodo + centro combinations into the new header table.
INSERT INTO `reportes_new` (`periodo_id`, `centro_id`, `created_at`, `updated_at`)
SELECT
    `periodo_id`,
    `centro_id`,
    MIN(`created_at`) AS `created_at`,
    MAX(`updated_at`) AS `updated_at`
FROM `reportes`
GROUP BY `periodo_id`, `centro_id`;

-- Preserve each old row as a new report item linked to its header.
INSERT INTO `reporte_items` (`reporte_id`, `cloro`, `conductividad`, `ph`, `temperatura`, `turbiedad`, `created_at`, `updated_at`)
SELECT
    `reportes_new`.`id`,
    `reportes`.`cloro`,
    `reportes`.`conductividad`,
    `reportes`.`ph`,
    `reportes`.`temperatura`,
    `reportes`.`turbiedad`,
    `reportes`.`created_at`,
    `reportes`.`updated_at`
FROM `reportes`
INNER JOIN `reportes_new`
    ON `reportes_new`.`periodo_id` = `reportes`.`periodo_id`
   AND `reportes_new`.`centro_id` = `reportes`.`centro_id`;

DROP TABLE `reportes`;

RENAME TABLE `reportes_new` TO `reportes`;

ALTER TABLE `reporte_items` DROP FOREIGN KEY `reporte_items_reporte_id_fkey`;
ALTER TABLE `reportes` DROP FOREIGN KEY `reportes_new_periodo_id_fkey`;
ALTER TABLE `reportes` DROP FOREIGN KEY `reportes_new_centro_id_fkey`;

ALTER TABLE `reportes` ADD CONSTRAINT `reportes_periodo_id_fkey` FOREIGN KEY (`periodo_id`) REFERENCES `periodos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `reportes` ADD CONSTRAINT `reportes_centro_id_fkey` FOREIGN KEY (`centro_id`) REFERENCES `centros`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `reporte_items` ADD CONSTRAINT `reporte_items_reporte_id_fkey` FOREIGN KEY (`reporte_id`) REFERENCES `reportes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
