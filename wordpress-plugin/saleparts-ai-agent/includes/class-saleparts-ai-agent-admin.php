<?php

if (!defined('ABSPATH')) {
    exit;
}

class SaleParts_AI_Agent_Admin {
    private const SETTINGS_CAPABILITY = 'manage_woocommerce';

    public function register_menu(): void {
        add_menu_page(
            'SaleParts AI Agent',
            'SaleParts AI Agent',
            self::SETTINGS_CAPABILITY,
            'saleparts-ai-agent-company',
            [$this, 'render_company_dashboard_page'],
            'dashicons-format-chat',
            56
        );

        add_submenu_page(
            'saleparts-ai-agent-company',
            'Company Dashboard',
            'Company Dashboard',
            'manage_options',
            'saleparts-ai-agent-company',
            [$this, 'render_company_dashboard_page']
        );

        add_submenu_page(
            'saleparts-ai-agent-company',
            'Client Owner Dashboard',
            'Client Owner Dashboard',
            self::SETTINGS_CAPABILITY,
            'saleparts-ai-agent-client',
            [$this, 'render_client_dashboard_page']
        );

        add_submenu_page(
            'saleparts-ai-agent-company',
            'Integration Settings',
            'Integration Settings',
            self::SETTINGS_CAPABILITY,
            'saleparts-ai-agent-settings',
            [$this, 'render_settings_page']
        );
    }

    public function register_settings(): void {
        register_setting('saleparts_ai_agent', 'saleparts_ai_backend_url', ['sanitize_callback' => 'esc_url_raw']);
        register_setting('saleparts_ai_agent', 'saleparts_wc_api_base', ['sanitize_callback' => 'esc_url_raw']);
        register_setting('saleparts_ai_agent', 'saleparts_voice_enabled', ['sanitize_callback' => [$this, 'sanitize_checkbox']]);
        register_setting('saleparts_ai_agent', 'saleparts_brand_name', ['sanitize_callback' => 'sanitize_text_field']);
        register_setting('saleparts_ai_agent', 'saleparts_brand_color', ['sanitize_callback' => [$this, 'sanitize_hex_color_option']]);
        register_setting('saleparts_ai_agent', 'saleparts_brand_logo_url', ['sanitize_callback' => 'esc_url_raw']);
        register_setting('saleparts_ai_agent', 'saleparts_brand_background_url', ['sanitize_callback' => 'esc_url_raw']);

        add_settings_section(
            'saleparts_ai_agent_main',
            'Backend & Integration Settings',
            function (): void {
                echo '<p>Configure your AI backend endpoint, WooCommerce connection, and widget branding.</p>';
            },
            'saleparts-ai-agent'
        );

        $this->add_text_field('saleparts_ai_backend_url', 'AI Backend URL', 'https://your-backend.vercel.app');
        $this->add_text_field('saleparts_wc_api_base', 'WooCommerce API Base URL', 'https://your-store.com/wp-json/wc/v3');
        $this->add_text_field('saleparts_brand_name', 'Brand Name', 'ecommerco.ai', 'text');
        $this->add_text_field('saleparts_brand_color', 'Brand Color', '#f5c518', 'text');
        $this->add_text_field('saleparts_brand_logo_url', 'Brand Logo URL', 'https://example.com/logo.png');
        $this->add_text_field('saleparts_brand_background_url', 'Widget Background Image URL', 'https://example.com/background.jpg');

        add_settings_field(
            'saleparts_voice_enabled',
            'Enable Voice Assistant',
            function (): void {
                $value = get_option('saleparts_voice_enabled', '1');
                echo '<label><input type="checkbox" name="saleparts_voice_enabled" value="1" ' . checked('1', $value, false) . ' /> Enable speech-to-text and text-to-speech in chat widget</label>';
            },
            'saleparts-ai-agent',
            'saleparts_ai_agent_main'
        );
    }

    public function option_group_capability(): string {
        return self::SETTINGS_CAPABILITY;
    }

    public function sanitize_checkbox($value): string {
        return (string) ((int) !empty($value));
    }

    public function sanitize_hex_color_option($value): string {
        $color = sanitize_hex_color((string) $value);
        return $color ?: '#f5c518';
    }

    private function add_text_field(string $option_name, string $label, string $placeholder, string $type = 'url'): void {
        add_settings_field(
            $option_name,
            $label,
            function () use ($option_name, $placeholder, $type): void {
                $value = esc_attr(get_option($option_name, ''));
                echo "<input type='{$type}' class='regular-text' name='{$option_name}' value='{$value}' placeholder='{$placeholder}' />";
            },
            'saleparts-ai-agent',
            'saleparts_ai_agent_main'
        );
    }

    private function question_table_exists(string $table): bool {
        global $wpdb;

        $found = $wpdb->get_var($wpdb->prepare('SHOW TABLES LIKE %s', $table));

        return $found === $table;
    }

    public function render_company_dashboard_page(): void {
        if (!current_user_can('manage_options')) {
            wp_die('You do not have permission to access this page.');
        }

        global $wpdb;

        $table = $wpdb->prefix . 'saleparts_ai_questions';
        $table_ready = $this->question_table_exists($table);
        $total_questions = $table_ready ? (int) $wpdb->get_var("SELECT COUNT(*) FROM {$table}") : 0;
        $today_questions = $table_ready ? (int) $wpdb->get_var($wpdb->prepare("SELECT COUNT(*) FROM {$table} WHERE DATE(created_at) = %s", current_time('Y-m-d'))) : 0;
        $top_questions = $table_ready ? $wpdb->get_results("SELECT question, COUNT(*) as total FROM {$table} GROUP BY question ORDER BY total DESC LIMIT 5") : [];
        $recent_questions = $table_ready ? $wpdb->get_results("SELECT question, source_page, user_role, created_at FROM {$table} ORDER BY id DESC LIMIT 10") : [];

        $backend_url = get_option('saleparts_ai_backend_url', '');
        $brand_name = get_option('saleparts_brand_name', 'ecommerco.ai');
        ?>
        <div class="wrap">
            <h1>SaleParts AI Agent — Company Dashboard</h1>
            <p>Agency view for <strong><?php echo esc_html($brand_name); ?></strong> to monitor client widget activity and deployment health.</p>
            <div style="display:flex;gap:16px;flex-wrap:wrap;margin:16px 0;">
                <div style="background:#fff;border:1px solid #ddd;padding:16px;min-width:220px;">
                    <h2 style="margin-top:0;">Total Questions</h2>
                    <p style="font-size:28px;margin:0;"><?php echo esc_html((string) $total_questions); ?></p>
                </div>
                <div style="background:#fff;border:1px solid #ddd;padding:16px;min-width:220px;">
                    <h2 style="margin-top:0;">Questions Today</h2>
                    <p style="font-size:28px;margin:0;"><?php echo esc_html((string) $today_questions); ?></p>
                </div>
                <div style="background:#fff;border:1px solid #ddd;padding:16px;min-width:360px;">
                    <h2 style="margin-top:0;">Backend Status</h2>
                    <p style="margin:0;"><?php echo $backend_url ? 'Connected to ' . esc_html($backend_url) : 'Not configured'; ?></p>
                </div>
            </div>

            <h2>Top Questions</h2>
            <table class="widefat striped">
                <thead><tr><th>Question</th><th>Count</th></tr></thead>
                <tbody>
                <?php if ($top_questions) : ?>
                    <?php foreach ($top_questions as $item) : ?>
                        <tr>
                            <td><?php echo esc_html($item->question); ?></td>
                            <td><?php echo esc_html((string) $item->total); ?></td>
                        </tr>
                    <?php endforeach; ?>
                <?php else : ?>
                    <tr><td colspan="2">No question data yet.</td></tr>
                <?php endif; ?>
                </tbody>
            </table>

            <h2>Latest Conversations</h2>
            <table class="widefat striped">
                <thead><tr><th>Question</th><th>Page</th><th>User Type</th><th>Time</th></tr></thead>
                <tbody>
                <?php if ($recent_questions) : ?>
                    <?php foreach ($recent_questions as $item) : ?>
                        <tr>
                            <td><?php echo esc_html($item->question); ?></td>
                            <td><?php echo esc_html($item->source_page); ?></td>
                            <td><?php echo esc_html($item->user_role); ?></td>
                            <td><?php echo esc_html($item->created_at); ?></td>
                        </tr>
                    <?php endforeach; ?>
                <?php else : ?>
                    <tr><td colspan="4">No conversation logs found.</td></tr>
                <?php endif; ?>
                </tbody>
            </table>
        </div>
        <?php
    }

    public function render_client_dashboard_page(): void {
        if (!current_user_can(self::SETTINGS_CAPABILITY) && !current_user_can('manage_options')) {
            wp_die('You do not have permission to access this page.');
        }

        global $wpdb;

        $table = $wpdb->prefix . 'saleparts_ai_questions';
        $recent_questions = $this->question_table_exists($table) ? $wpdb->get_results("SELECT question, ai_reply, created_at FROM {$table} ORDER BY id DESC LIMIT 15") : [];
        ?>
        <div class="wrap">
            <h1>SaleParts AI Agent — Client Owner Dashboard</h1>
            <p>This dashboard is for store owners to configure API access and review customer questions from the AI widget.</p>
            <p>
                <a class="button button-primary" href="<?php echo esc_url(admin_url('admin.php?page=saleparts-ai-agent-settings')); ?>">Open Integration Settings</a>
            </p>

            <h2>Recent Customer Questions</h2>
            <table class="widefat striped">
                <thead><tr><th>Question</th><th>AI Reply</th><th>Time</th></tr></thead>
                <tbody>
                <?php if ($recent_questions) : ?>
                    <?php foreach ($recent_questions as $item) : ?>
                        <tr>
                            <td><?php echo esc_html($item->question); ?></td>
                            <td><?php echo esc_html($item->ai_reply); ?></td>
                            <td><?php echo esc_html($item->created_at); ?></td>
                        </tr>
                    <?php endforeach; ?>
                <?php else : ?>
                    <tr><td colspan="3">No customer questions logged yet.</td></tr>
                <?php endif; ?>
                </tbody>
            </table>
        </div>
        <?php
    }

    public function render_settings_page(): void {
        if (!current_user_can(self::SETTINGS_CAPABILITY) && !current_user_can('manage_options')) {
            wp_die('You do not have permission to access this page.');
        }
        ?>
        <div class="wrap">
            <h1>SaleParts AI Agent — Integration Settings</h1>
            <p>Connect your WordPress site to the AI backend and configure brand/voice options.</p>
            <form method="post" action="options.php">
                <?php
                settings_fields('saleparts_ai_agent');
                do_settings_sections('saleparts-ai-agent');
                submit_button('Save Configuration');
                ?>
            </form>
            <hr />
            <h2>Embedding Sync</h2>
            <p>Run <code>npm run sync:products</code> in the backend folder to sync WooCommerce products into your vector database.</p>
        </div>
        <?php
    }
}
