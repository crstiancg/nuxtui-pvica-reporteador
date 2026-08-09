-- AlterTable
ALTER TABLE `parametros` ADD COLUMN `limite_max` DOUBLE NULL,
    ADD COLUMN `limite_min` DOUBLE NULL,
    ADD COLUMN `norma` VARCHAR(100) NULL,
    ADD COLUMN `unidad` VARCHAR(30) NULL;
