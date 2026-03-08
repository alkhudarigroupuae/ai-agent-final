<?php

if (!defined('ABSPATH')) {
    exit;
}

class SaleParts_AI_Agent_API {
    public function register_routes(): void {
        register_rest_route('saleparts-ai/v1', '/config', [
            'methods' => 'GET',
            'callback' => [$this, 'get_public_config'],
            'permission_callback' => '__return_true',
        ]);

        register_rest_route('saleparts-ai/v1', '/log-question', [
            'methods' => 'POST',
            'callback' => [$this, 'log_question'],
            'permission_callback' => '__return_true',
        ]);
    }

    public function get_public_config(): WP_REST_Response {
        return new WP_REST_Response([
            'siteName' => get_bloginfo('name'),
            'voiceEnabled' => get_option('saleparts_voice_enabled', '1') === '1',
            'backendUrl' => get_option('saleparts_ai_backend_url', ''),
        ]);
    }

    public function log_question(WP_REST_Request $request): WP_REST_Response {
        $question = sanitize_text_field((string) $request->get_param('question'));
        $ai_reply = sanitize_textarea_field((string) $request->get_param('aiReply'));
        $source_page = esc_url_raw((string) $request->get_param('sourcePage'));

        if ($question === '') {
            return new WP_REST_Response(['success' => false, 'message' => 'Question is required.'], 400);
        }

        $user = wp_get_current_user();
        $user_role = 'guest';
        if ($user && !empty($user->roles)) {
            $user_role = implode(',', array_map('sanitize_key', $user->roles));
        }

        global $wpdb;

        $table = $wpdb->prefix . 'saleparts_ai_questions';
        $result = $wpdb->insert(
            $table,
            [
                'question' => $question,
                'ai_reply' => $ai_reply,
                'source_page' => $source_page,
                'user_role' => $user_role,
                'created_at' => current_time('mysql'),
            ],
            ['%s', '%s', '%s', '%s', '%s']
        );

        if ($result === false) {
            return new WP_REST_Response(['success' => false, 'message' => 'Unable to save question log.'], 500);
        }

        return new WP_REST_Response(['success' => true]);
    }
}
