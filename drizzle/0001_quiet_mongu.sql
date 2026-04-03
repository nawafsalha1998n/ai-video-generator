CREATE TABLE `videos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`requestId` varchar(255) NOT NULL,
	`type` enum('text-to-video','image-to-video') NOT NULL,
	`prompt` text NOT NULL,
	`imageUrl` text,
	`videoUrl` text,
	`status` enum('pending','done','failed','expired') NOT NULL DEFAULT 'pending',
	`duration` int NOT NULL,
	`aspectRatio` varchar(10) NOT NULL DEFAULT '16:9',
	`resolution` varchar(10) NOT NULL DEFAULT '720p',
	`errorMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`completedAt` timestamp,
	CONSTRAINT `videos_id` PRIMARY KEY(`id`),
	CONSTRAINT `videos_requestId_unique` UNIQUE(`requestId`)
);
--> statement-breakpoint
ALTER TABLE `videos` ADD CONSTRAINT `videos_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;