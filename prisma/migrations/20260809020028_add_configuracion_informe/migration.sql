-- CreateTable
CREATE TABLE `configuracion_informe` (
    `id` INTEGER NOT NULL DEFAULT 1,
    `entidad_emisora` VARCHAR(200) NULL,
    `ciudad` VARCHAR(100) NULL,
    `destinatario_nombre` VARCHAR(150) NULL,
    `destinatario_cargo` VARCHAR(150) NULL,
    `firmante_nombre` VARCHAR(150) NULL,
    `firmante_cargo` VARCHAR(150) NULL,
    `firmante_colegiatura` VARCHAR(50) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
