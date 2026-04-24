-- CreateTable
CREATE TABLE `centros` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `departamento` VARCHAR(100) NOT NULL,
    `provincia` VARCHAR(100) NOT NULL,
    `distrito` VARCHAR(100) NOT NULL,
    `codigo_ubigeo` VARCHAR(6) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `centros_codigo_ubigeo_key`(`codigo_ubigeo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
