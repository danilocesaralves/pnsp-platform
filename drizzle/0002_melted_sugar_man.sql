ALTER TABLE `academy_content` MODIFY COLUMN `tags` json;--> statement-breakpoint
ALTER TABLE `offerings` MODIFY COLUMN `tags` json;--> statement-breakpoint
ALTER TABLE `opportunities` MODIFY COLUMN `tags` json;--> statement-breakpoint
ALTER TABLE `profiles` MODIFY COLUMN `specialties` json;--> statement-breakpoint
ALTER TABLE `profiles` MODIFY COLUMN `instruments` json;--> statement-breakpoint
ALTER TABLE `profiles` MODIFY COLUMN `genres` json;--> statement-breakpoint
ALTER TABLE `profiles` MODIFY COLUMN `tags` json;--> statement-breakpoint
ALTER TABLE `studios` MODIFY COLUMN `equipment` json;--> statement-breakpoint
ALTER TABLE `studios` MODIFY COLUMN `amenities` json;