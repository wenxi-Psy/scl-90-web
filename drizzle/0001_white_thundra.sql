CREATE TABLE `scl_analytics_summary` (
	`id` int AUTO_INCREMENT NOT NULL,
	`period` varchar(20) NOT NULL,
	`periodDate` varchar(20) NOT NULL,
	`totalAssessments` int NOT NULL,
	`totalUsers` int NOT NULL,
	`averageTotalScore` varchar(10) NOT NULL,
	`averagePositiveItems` varchar(10) NOT NULL,
	`scoreDistribution` json NOT NULL,
	`factorPrevalence` json NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `scl_analytics_summary_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `scl_assessments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`responses` json NOT NULL,
	`totalScore` int NOT NULL,
	`positiveItemCount` int NOT NULL,
	`averageScore` varchar(10) NOT NULL,
	`factorScores` json NOT NULL,
	`isAnonymous` int NOT NULL DEFAULT 0,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `scl_assessments_id` PRIMARY KEY(`id`)
);
