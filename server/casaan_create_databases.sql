-- phpMyAdmin SQL Dump
-- version 4.5.4.1deb2ubuntu2
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: Jan 25, 2017 at 07:46 PM
-- Server version: 5.7.17-0ubuntu0.16.04.1
-- PHP Version: 7.0.13-0ubuntu0.16.04.1

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

CREATE DATABASE casaan;
USE casaan;

CREATE USER 'casaan'@'localhost' IDENTIFIED BY 'casaan';
GRANT ALL PRIVILEGES ON casaan.* TO 'casaan'@'localhost'; 

--
-- Database: `casaan`
--

-- --------------------------------------------------------

CREATE DATABASE `casaan`;
USE `casaan`;


--
-- Table structure for table `electricitymeter`
--

CREATE TABLE `electricitymeter` (
  `id` int(10) UNSIGNED NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `kw_using` decimal(6,2) UNSIGNED NOT NULL,
  `kw_providing` decimal(6,2) UNSIGNED NOT NULL,
  `kwh_used1` decimal(10,3) UNSIGNED NOT NULL,
  `kwh_used2` decimal(10,3) UNSIGNED NOT NULL,
  `kwh_provided1` decimal(10,3) UNSIGNED NOT NULL,
  `kwh_provided2` decimal(10,3) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `gasmeter`
--

CREATE TABLE `gasmeter` (
  `id` int(10) UNSIGNED NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `m3` decimal(12,3) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `sunelectricity`
--

CREATE TABLE `sunelectricity` (
  `id` int(10) UNSIGNED NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `kwh_today` decimal(12,3) NOT NULL,
  `kwh_total` decimal(12,3) NOT NULL,
  `pv_volt` decimal(12,3) NOT NULL,
  `pv_amp` decimal(12,3) NOT NULL,
  `pv_watt` decimal(12,3) NOT NULL,
  `grid_volt` decimal(12,3) NOT NULL,
  `grid_amp` decimal(12,3) NOT NULL,
  `grid_watt` decimal(12,3) NOT NULL,
  `grid_freq` decimal(12,3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `temperature`
--

CREATE TABLE `temperature` (
  `id` int(11) UNSIGNED NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `sensorid` varchar(20) CHARACTER SET utf8 COLLATE utf8_unicode_ci NOT NULL,
  `degree_c` decimal(6,1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `watermeter`
--

CREATE TABLE `watermeter` (
  `id` int(11) NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `m3` decimal(16,3) NOT NULL,
  `m3h` decimal(8,3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `electricitymeter`
--
ALTER TABLE `electricitymeter`
  ADD PRIMARY KEY (`id`),
  ADD KEY `timestamp` (`timestamp`);

--
-- Indexes for table `gasmeter`
--
ALTER TABLE `gasmeter`
  ADD PRIMARY KEY (`id`),
  ADD KEY `timestamp` (`timestamp`);

--
-- Indexes for table `sunelectricity`
--
ALTER TABLE `sunelectricity`
  ADD PRIMARY KEY (`id`),
  ADD KEY `timestamp` (`timestamp`);

--
-- Indexes for table `temperature`
--
ALTER TABLE `temperature`
  ADD PRIMARY KEY (`id`),
  ADD KEY `timestamp` (`timestamp`);

--
-- Indexes for table `watermeter`
--
ALTER TABLE `watermeter`
  ADD PRIMARY KEY (`id`),
  ADD KEY `timestamp` (`timestamp`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `electricitymeter`
--
ALTER TABLE `electricitymeter`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `gasmeter`
--
ALTER TABLE `gasmeter`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `sunelectricity`
--
ALTER TABLE `sunelectricity`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `temperature`
--
ALTER TABLE `temperature`
  MODIFY `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `watermeter`
--
ALTER TABLE `watermeter`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;
  