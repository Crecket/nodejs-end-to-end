CREATE DATABASE `nodejs_db` /*!40100 DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci */;
USE `nodejs_db`;

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `hash` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `salt` varchar(64) COLLATE utf8_unicode_ci NOT NULL,
  `registered` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

INSERT INTO `users` (`id`, `username`, `hash`, `salt`, `registered`) VALUES
(1,	'crecket',	'$2a$11$FcZ1LLFivE65UwLF7bdHau7EAsuohnGhogzmzzsqMKx5WI/5B.A4C',	'89054bff962ab026ce20bc47e102454dd5da926c8c31045e7be925f665fd2e76',	'2016-04-06 21:35:54'),
(2,	'admin',	'$2a$11$H3j90M9IAG.SLpmc.pMfpesYJ5YLlG/dwVpRaHKOqZXGASXvpTeh.',	'c7c728510e08d8c3af886f3dbd85649108cdd98ee68bd620105658a72eb0723d',	'2016-04-06 21:35:54');
-- passwords are 1234