<?php
/**
 * Plugin Name: Italiano Bello – Mini Games
 * Description: Interaktive Lernspiele für Italiano Bello (Shortcodes).
 * Version: 0.1.0
 * Author: Daniel De Zordi
 */

defined('ABSPATH') || exit;

function ib_games_public_base() {
  return plugins_url('assets/public/', __FILE__);
}

function ib_games_enqueue_global_styles() {
  $css = plugin_dir_path(__FILE__) . 'assets/bundles/global.css';
  if (file_exists($css)) {
    wp_enqueue_style(
      'ib-games-global',
      plugins_url('assets/bundles/global.css', __FILE__),
      [],
      filemtime($css)
    );
  }
}

function ib_games_enqueue_conversation_cards() {
  ib_games_enqueue_global_styles();

  $js = plugin_dir_path(__FILE__) . 'assets/bundles/conversation-cards.bundle.js';
  $css = plugin_dir_path(__FILE__) . 'assets/bundles/conversation-cards.css';

  if (file_exists($css)) {
    wp_enqueue_style(
      'ib-conversation-cards',
      plugins_url('assets/bundles/conversation-cards.css', __FILE__),
      [],
      filemtime($css)
    );
  }

  wp_enqueue_script(
    'ib-conversation-cards',
    plugins_url('assets/bundles/conversation-cards.bundle.js', __FILE__),
    [],
    file_exists($js) ? filemtime($js) : '0.1.0',
    true
  );

  wp_add_inline_script(
    'ib-conversation-cards',
    'window.__IB_PUBLIC_BASE__ = "' . esc_js(plugins_url('assets/public/', __FILE__)) . '";',
    'before'
  );
}

add_shortcode('ib_conversation_cards', function($atts) {
  $atts = shortcode_atts([
    'level' => '',
    'topic' => ''
  ], $atts, 'ib_conversation_cards');

  ib_games_enqueue_conversation_cards();

  $id = 'ib-cc-' . wp_generate_uuid4();

  return sprintf(
    '<div id="%s" class="ib-conversation-cards" data-level="%s" data-topic="%s"></div>',
    esc_attr($id),
    esc_attr($atts['level']),
    esc_attr($atts['topic'])
  );
});
