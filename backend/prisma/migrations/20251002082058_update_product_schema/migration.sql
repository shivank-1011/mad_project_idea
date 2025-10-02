-- AlterTable
ALTER TABLE `Product` ADD COLUMN `expertView` VARCHAR(191) NULL,
    ADD COLUMN `releaseDate` VARCHAR(191) NULL,
    ADD COLUMN `totalRatings` VARCHAR(191) NULL,
    MODIFY `rating` DOUBLE NULL,
    MODIFY `affiliateLink` VARCHAR(191) NULL;
