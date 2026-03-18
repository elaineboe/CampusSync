<?php

class Response {
    public static function json($data, $status_code = 200) {
        http_response_code($status_code);
        echo json_encode($data);
        exit();
    }

    public static function error($message, $status_code = 400) {
        self::json(['error' => $message], $status_code);
    }
}
