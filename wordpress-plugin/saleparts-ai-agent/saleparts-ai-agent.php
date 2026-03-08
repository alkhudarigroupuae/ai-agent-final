<?php
/**
 * Plugin Name: SaleParts AI Agent
 * Description: AI-powered WooCommerce assistant for product search, voice chat, and manager productivity tools.
 * Version: 1.0.0
 * Author: SaleParts
 * Requires at least: 6.0
 * Requires PHP: 8.0
 */

if (!defined('ABSPATH')) {
    exit;
}

define('SALEPARTS_AI_AGENT_VERSION', '1.0.0');
define('SALEPARTS_AI_AGENT_PATH', plugin_dir_path(__FILE__));
define('SALEPARTS_AI_AGENT_URL', plugin_dir_url(__FILE__));

require_once SALEPARTS_AI_AGENT_PATH . 'includes/class-saleparts-ai-agent.php';

function saleparts_ai_agent_activate(): void {
    global $wpdb;

    $table_name = $wpdb->prefix . 'saleparts_ai_questions';
    $charset_collate = $wpdb->get_charset_collate();

    $sql = "CREATE TABLE {$table_name} (
        id BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
        question TEXT NOT NULL,
        ai_reply LONGTEXT NULL,
        source_page VARCHAR(255) NULL,
        user_role VARCHAR(100) NULL,
        created_at DATETIME NOT NULL,
        PRIMARY KEY (id)
    ) {$charset_collate};";

    require_once ABSPATH . 'wp-admin/includes/upgrade.php';
    dbDelta($sql);
}

register_activation_hook(__FILE__, 'saleparts_ai_agent_activate');

function saleparts_ai_agent_bootstrap(): void {
    $plugin = new SaleParts_AI_Agent();
    $plugin->run();
}

saleparts_ai_agent_bootstrap();
