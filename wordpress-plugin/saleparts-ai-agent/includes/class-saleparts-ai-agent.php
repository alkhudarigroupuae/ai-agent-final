<?php

if (!defined('ABSPATH')) {
    exit;
}

require_once SALEPARTS_AI_AGENT_PATH . 'includes/class-saleparts-ai-agent-admin.php';
require_once SALEPARTS_AI_AGENT_PATH . 'includes/class-saleparts-ai-agent-api.php';

class SaleParts_AI_Agent {
    private SaleParts_AI_Agent_Admin $admin;
    private SaleParts_AI_Agent_API $api;

    public function __construct() {
        $this->admin = new SaleParts_AI_Agent_Admin();
        $this->api = new SaleParts_AI_Agent_API();
    }

    public function run(): void {
        add_action('admin_menu', [$this->admin, 'register_menu']);
        add_action('admin_init', [$this->admin, 'register_settings']);
        add_filter('option_page_capability_saleparts_ai_agent', [$this->admin, 'option_group_capability']);
        add_action('wp_enqueue_scripts', [$this, 'enqueue_public_assets']);
        add_action('rest_api_init', [$this->api, 'register_routes']);
        add_shortcode('saleparts_ai_chat', [$this, 'render_chat_widget']);
    }

    public function enqueue_public_assets(): void {
        wp_enqueue_style('saleparts-ai-agent', SALEPARTS_AI_AGENT_URL . 'assets/css/chat-widget.css', [], SALEPARTS_AI_AGENT_VERSION);
        wp_enqueue_script('saleparts-ai-agent', SALEPARTS_AI_AGENT_URL . 'assets/js/chat-widget.js', [], SALEPARTS_AI_AGENT_VERSION, true);

        wp_localize_script('saleparts-ai-agent', 'SalePartsAgentConfig', [
            'apiBase' => esc_url_raw(get_option('saleparts_ai_backend_url', '')),
            'nonce' => wp_create_nonce('wp_rest'),
            'siteName' => get_bloginfo('name'),
            'voiceEnabled' => get_option('saleparts_voice_enabled', '1') === '1',
            'brandName' => get_option('saleparts_brand_name', 'ecommerco.ai'),
            'brandColor' => get_option('saleparts_brand_color', '#f5c518'),
            'brandLogoUrl' => get_option('saleparts_brand_logo_url', ''),
            'brandBackgroundUrl' => get_option('saleparts_brand_background_url', ''),
            'wpApiRoot' => esc_url_raw(rest_url('saleparts-ai/v1')),
        ]);
    }

    public function render_chat_widget(): string {
        ob_start();
        include SALEPARTS_AI_AGENT_PATH . 'templates/chat-widget.php';

        return (string) ob_get_clean();
    }
}
