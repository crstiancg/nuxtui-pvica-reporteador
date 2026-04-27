ALTER TABLE `reporte_items`
    CHANGE COLUMN `cloro` `decreto_cloro` DOUBLE NULL,
    CHANGE COLUMN `conductividad` `decreto_conductividad` DOUBLE NULL,
    CHANGE COLUMN `ph` `decreto_ph` DOUBLE NULL,
    CHANGE COLUMN `temperatura` `decreto_temperatura` DOUBLE NULL,
    CHANGE COLUMN `turbiedad` `decreto_turbiedad` DOUBLE NULL;
