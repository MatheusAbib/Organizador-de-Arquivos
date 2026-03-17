-- phpMyAdmin SQL Dump
-- version 3.4.9
-- http://www.phpmyadmin.net
--
-- Servidor: localhost
-- Tempo de Geração: 11/03/2026 às 14h11min
-- Versão do Servidor: 5.5.20
-- Versão do PHP: 5.3.9

SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Banco de Dados: `organizador_arquivos`
--

-- --------------------------------------------------------

--
-- Estrutura da tabela `arquivos`
--

CREATE TABLE IF NOT EXISTS `arquivos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `usuario_id` int(11) NOT NULL,
  `nome_original` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nome_arquivo` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo_arquivo` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tamanho` int(11) NOT NULL,
  `data_upload` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `pasta_id` int(11) DEFAULT NULL,
  `comentario` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  KEY `usuario_id` (`usuario_id`),
  KEY `pasta_id` (`pasta_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci AUTO_INCREMENT=25 ;

--
-- Extraindo dados da tabela `arquivos`
--

INSERT INTO `arquivos` (`id`, `usuario_id`, `nome_original`, `nome_arquivo`, `tipo_arquivo`, `tamanho`, `data_upload`, `pasta_id`, `comentario`) VALUES
(11, 2, 'Carai.txt', '1773150014036-SITES.txt', 'texto', 1214, '2026-03-10 13:40:14', NULL, NULL),
(16, 2, 'Profile (3).pdf', '1773153307491-Profile (3).pdf', 'pdf', 50106, '2026-03-10 14:35:07', NULL, NULL),
(18, 2, 'boleto-Maro_-2026.pdf', '1773153489704-boleto-Maro_-2026.pdf', 'pdf', 99394, '2026-03-10 14:38:09', 10, NULL),
(19, 2, 'SITES.txt', '1773153698339-SITES.txt', 'texto', 1214, '2026-03-10 14:41:38', NULL, 'rrjyjyjyjyjyyjeeeeeeedgdgdgdgdgeeeeeeeee'),
(21, 3, 'boleto-Maro_-2026.pdf', '1773155933434-boleto-Maro_-2026.pdf', 'pdf', 99394, '2026-03-10 15:18:53', 8, NULL),
(22, 3, 'certificado.png', '1773156293470-certificado.png', 'imagem', 234077, '2026-03-10 15:24:53', 8, NULL),
(23, 2, '1773150071549-Codigos_Dart_Desenvolvimento_de_Aplicacoes (1) (1).docx', '1773157012593-1773150071549-Codigos_Dart_Desenvolvimento_de_Aplicacoes (1) (1).docx', 'word', 38294, '2026-03-10 15:36:52', 10, NULL),
(24, 2, 'econverse.png', '1773159152011-Logo.png', 'imagem', 3141, '2026-03-10 16:12:32', 9, NULL);

-- --------------------------------------------------------

--
-- Estrutura da tabela `compartilhamentos`
--

CREATE TABLE IF NOT EXISTS `compartilhamentos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `pasta_id` int(11) NOT NULL,
  `usuario_compartilhado_id` int(11) NOT NULL,
  `permissao` enum('visualizar','editar') COLLATE utf8mb4_unicode_ci DEFAULT 'visualizar',
  `data_compartilhamento` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_compartilhamento` (`pasta_id`,`usuario_compartilhado_id`),
  KEY `usuario_compartilhado_id` (`usuario_compartilhado_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci AUTO_INCREMENT=6 ;

-- --------------------------------------------------------

--
-- Estrutura da tabela `pastas`
--

CREATE TABLE IF NOT EXISTS `pastas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `usuario_id` int(11) NOT NULL,
  `nome` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `pasta_pai_id` int(11) DEFAULT NULL,
  `favorito` tinyint(1) DEFAULT '0',
  `data_criacao` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_pasta_usuario` (`usuario_id`,`nome`,`pasta_pai_id`),
  KEY `pasta_pai_id` (`pasta_pai_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci AUTO_INCREMENT=30 ;

--
-- Extraindo dados da tabela `pastas`
--

INSERT INTO `pastas` (`id`, `usuario_id`, `nome`, `pasta_pai_id`, `favorito`, `data_criacao`) VALUES
(8, 3, 'ededed', NULL, 0, '2026-03-10 15:18:49'),
(9, 2, 'Teste', NULL, 0, '2026-03-10 16:12:05'),
(10, 2, 'teste 01', 9, 0, '2026-03-10 16:12:12'),
(11, 2, 'dfdff', 10, 0, '2026-03-11 10:58:53'),
(12, 2, 'efef', 11, 0, '2026-03-11 11:34:52'),
(13, 2, 'fefef', 12, 0, '2026-03-11 11:34:56'),
(15, 2, 'cdcdc', 13, 0, '2026-03-11 11:38:49'),
(16, 2, 'dcdvrhtth', 15, 0, '2026-03-11 11:38:52'),
(17, 2, 'lllllllllll', 16, 0, '2026-03-11 11:38:57'),
(18, 2, 'çççççççç', 17, 0, '2026-03-11 11:39:04'),
(19, 2, 'ooooooooooooo', 18, 0, '2026-03-11 11:39:08'),
(20, 2, 'oooooog', 19, 0, '2026-03-11 11:39:17'),
(21, 2, 'ffhfhhf', NULL, 0, '2026-03-11 12:36:16'),
(22, 2, 'ffffff', NULL, 0, '2026-03-11 12:36:20'),
(23, 2, 'ryhrrrrrrrrrr', NULL, 0, '2026-03-11 12:36:33'),
(24, 2, 'rrrrrrrrrrrrrrrrr', 23, 0, '2026-03-11 12:36:39'),
(25, 2, 'hhhh', 24, 0, '2026-03-11 12:36:47'),
(26, 2, 'hhhhh', 25, 0, '2026-03-11 12:37:05'),
(29, 2, 'wdwdwd', 22, 0, '2026-03-11 12:59:44');

-- --------------------------------------------------------

--
-- Estrutura da tabela `usuarios`
--

CREATE TABLE IF NOT EXISTS `usuarios` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `senha` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `data_criacao` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci AUTO_INCREMENT=4 ;

--
-- Extraindo dados da tabela `usuarios`
--

INSERT INTO `usuarios` (`id`, `nome`, `email`, `senha`, `data_criacao`) VALUES
(2, 'Lucia', 'lucia@gmail.com', '$2b$10$vYkm7bCRZptFdDkAG9j95ui.vcPvrKaM92y.sbnWAx9EXuzx3Bqma', '2026-03-10 13:39:09'),
(3, 'Matheus', 'matheus@gmail.com', '$2b$10$RYT.sdUIY6RwsryHQ3LVoOnqC9DTZyNsXWuXOP9DlpHp1al9/eeJ2', '2026-03-10 14:18:41');

--
-- Restrições para as tabelas dumpadas
--

--
-- Restrições para a tabela `arquivos`
--
ALTER TABLE `arquivos`
  ADD CONSTRAINT `arquivos_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `arquivos_ibfk_2` FOREIGN KEY (`pasta_id`) REFERENCES `pastas` (`id`) ON DELETE SET NULL;

--
-- Restrições para a tabela `compartilhamentos`
--
ALTER TABLE `compartilhamentos`
  ADD CONSTRAINT `compartilhamentos_ibfk_1` FOREIGN KEY (`pasta_id`) REFERENCES `pastas` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `compartilhamentos_ibfk_2` FOREIGN KEY (`usuario_compartilhado_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

--
-- Restrições para a tabela `pastas`
--
ALTER TABLE `pastas`
  ADD CONSTRAINT `pastas_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `pastas_ibfk_2` FOREIGN KEY (`pasta_pai_id`) REFERENCES `pastas` (`id`) ON DELETE CASCADE;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
