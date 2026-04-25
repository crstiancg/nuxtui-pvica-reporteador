-- CreateTable
CREATE TABLE `periodos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `anio` INTEGER NOT NULL,
    `mes` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `periodos_anio_mes_key`(`anio`, `mes`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reportes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `periodo_id` INTEGER NOT NULL,
    `cloro` DOUBLE NOT NULL,
    `conductividad` DOUBLE NOT NULL,
    `ph` DOUBLE NOT NULL,
    `temperatura` DOUBLE NOT NULL,
    `turbiedad` DOUBLE NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `reportes_periodo_id_idx`(`periodo_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `parametros` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `codigo_cabecera` VARCHAR(100) NOT NULL,
    `valor` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `reportes` ADD CONSTRAINT `reportes_periodo_id_fkey` FOREIGN KEY (`periodo_id`) REFERENCES `periodos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
