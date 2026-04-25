-- AlterTable
ALTER TABLE `reportes` ADD COLUMN `centro_id` INTEGER NULL;

-- Backfill existing reportes with the first centro.
UPDATE `reportes`
SET `centro_id` = (SELECT `id` FROM `centros` ORDER BY `id` LIMIT 1)
WHERE `centro_id` IS NULL;

ALTER TABLE `reportes` MODIFY `centro_id` INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX `reportes_centro_id_idx` ON `reportes`(`centro_id`);

-- AddForeignKey
ALTER TABLE `reportes` ADD CONSTRAINT `reportes_centro_id_fkey` FOREIGN KEY (`centro_id`) REFERENCES `centros`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
