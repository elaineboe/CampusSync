<?php
require_once __DIR__ . '/../controllers/EventController.php';

$request_method = $_SERVER['REQUEST_METHOD'];
$request_uri = $_SERVER['REQUEST_URI'];
$base_path = '/api';

// Normalize URI to handle Nuwebspace trailing slashes or /backend/api/ vs /api/
$parsed_uri = parse_url($request_uri, PHP_URL_PATH);

if (strpos($parsed_uri, '/events') !== false) {
    $controller = new EventController();
    
    // Extract Event ID from URI if present (e.g. /api/events/123)
    $uri_parts = explode('/', parse_url($request_uri, PHP_URL_PATH));
    $eventsIndex = array_search('events', $uri_parts);
    $eventId = ($eventsIndex !== false && isset($uri_parts[$eventsIndex + 1])) ? intval($uri_parts[$eventsIndex + 1]) : null;

    $isHistoryAction = (strpos($request_uri, '/events/history') !== false);
    $isStudentCalendar = (strpos($request_uri, '/events/student') !== false);

    if ($request_method === 'GET') {
        if ($isHistoryAction) {
            $controller->getEventHistory();
        } elseif ($isStudentCalendar) {
            $controller->getStudentCalendar();
        } else {
            $controller->getEvents();
        }
    } elseif ($request_method === 'POST') {
        $controller->createEvent();
    } elseif ($request_method === 'PUT' && $eventId) {
        $controller->updateEvent($eventId);
    } elseif ($request_method === 'DELETE' && $eventId) {
        $controller->deleteEvent($eventId);
    } else {
        http_response_code(405);
        echo json_encode(['error' => 'Method Not Allowed or Missing ID']);
    }
} elseif (strpos($parsed_uri, '/notifications') !== false) {
    require_once __DIR__ . '/../controllers/NotificationController.php';
    $controller = new NotificationController();
    
    // Extract ID for marking as read (e.g. /api/notifications/5/read)
    $uri_parts = explode('/', parse_url($request_uri, PHP_URL_PATH));
    $notificationsIndex = array_search('notifications', $uri_parts);
    $notificationId = ($notificationsIndex !== false && isset($uri_parts[$notificationsIndex + 1])) ? intval($uri_parts[$notificationsIndex + 1]) : null;
    $isReadAction = ($notificationsIndex !== false && isset($uri_parts[$notificationsIndex + 2]) && $uri_parts[$notificationsIndex + 2] === 'read');

    if ($request_method === 'GET') {
        $controller->getNotifications();
    } elseif ($request_method === 'PUT' && $notificationId && $isReadAction) {
        $controller->markAsRead($notificationId);
    } else {
        http_response_code(405);
        echo json_encode(['error' => 'Method Not Allowed']);
    }
} elseif (strpos($parsed_uri, '/supervision') !== false) {
    require_once __DIR__ . '/../controllers/SupervisionController.php';
    $controller = new SupervisionController();
    
    // Sub-routing for Supervision logic
    if (strpos($request_uri, '/supervision/slots') !== false) {
        if ($request_method === 'GET') {
            $controller->getAvailableSlots(); // Global available slots for students
        } elseif ($request_method === 'POST') {
            $controller->createSlot(); // Lecturer generating a new slot
        } else {
            http_response_code(405);
            echo json_encode(['error' => 'Method Not Allowed']);
        }
    } elseif (strpos($request_uri, '/supervision/book') !== false && $request_method === 'POST') {
        $controller->bookSlot(); // Student booking a slot
    } elseif (strpos($request_uri, '/supervision/lecturer/slots') !== false && $request_method === 'GET') {
        $controller->getLecturerSlots(); // Lecturer's personal published slots
    } elseif (strpos($request_uri, '/supervision/student/bookings') !== false) {
        if ($request_method === 'GET') {
            $controller->getMyBookings(); // Student's personal bookings
        } elseif ($request_method === 'DELETE') {
            // Extract Booking ID from URI (e.g. /api/supervision/student/bookings/12)
            $uri_parts = explode('/', parse_url($request_uri, PHP_URL_PATH));
            $bookIndex = array_search('bookings', $uri_parts);
            $bookingId = ($bookIndex !== false && isset($uri_parts[$bookIndex + 1])) ? intval($uri_parts[$bookIndex + 1]) : null;
            
            if ($bookingId) {
                $controller->cancelBooking($bookingId);
            } else {
                http_response_code(400);
                echo json_encode(['error' => 'Booking ID missing']);
            }
        } else {
            http_response_code(405);
            echo json_encode(['error' => 'Method Not Allowed']);
        }
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'Supervision route not found']);
    }
} elseif (strpos($parsed_uri, '/users') !== false) {
    require_once __DIR__ . '/../controllers/UserController.php';
    $controller = new UserController();

    // Extract ID and Action (e.g. /api/users/5/modules)
    $uri_parts = explode('/', parse_url($request_uri, PHP_URL_PATH));
    $usersIndex = array_search('users', $uri_parts);
    $userId = ($usersIndex !== false && isset($uri_parts[$usersIndex + 1])) ? intval($uri_parts[$usersIndex + 1]) : null;
    $action = ($usersIndex !== false && isset($uri_parts[$usersIndex + 2])) ? $uri_parts[$usersIndex + 2] : null;

    if ($request_method === 'GET') {
        if ($userId && $action === 'modules') {
            $controller->getUserModules($userId);
        } elseif ($userId) {
            // Placeholder for single user fetch if needed, currently falls back to list
            $controller->getAllUsers();
        } else {
            $controller->getAllUsers();
        }
    } elseif ($request_method === 'POST') {
        $controller->createUser();
    } elseif ($request_method === 'PUT') {
        if ($userId && $action === 'role') {
            $controller->updateRole($userId);
        } elseif ($userId && $action === 'status') {
            $controller->updateStatus($userId);
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid update action on users']);
        }
    } else {
        http_response_code(405);
        echo json_encode(['error' => 'Method Not Allowed']);
    }
} elseif (strpos($parsed_uri, '/modules') !== false) {
    require_once __DIR__ . '/../controllers/ModuleController.php';
    $controller = new ModuleController();

    // Check for specific sub-routes
    $uri_parts = explode('/', parse_url($request_uri, PHP_URL_PATH));
    $modulesIndex = array_search('modules', $uri_parts);

    if (strpos($request_uri, '/modules/assignments') !== false) {
        if ($request_method === 'GET') {
            $controller->getAssignments();
        } else {
            http_response_code(405);
            echo json_encode(['error' => 'Method Not Allowed']);
        }
    } elseif (strpos($parsed_uri, '/modules/assign') !== false) {
        if ($request_method === 'POST') {
            $controller->assignModules();
        } elseif ($request_method === 'DELETE') {
            // Expected: /api/modules/assign/{userId}/{moduleId}
            $userId = isset($uri_parts[$modulesIndex + 2]) ? intval($uri_parts[$modulesIndex + 2]) : null;
            $moduleId = isset($uri_parts[$modulesIndex + 3]) ? intval($uri_parts[$modulesIndex + 3]) : null;

            if ($userId && $moduleId) {
                $controller->removeAssignment($userId, $moduleId);
            } else {
                http_response_code(400);
                echo json_encode(['error' => 'User ID and Module ID required for deletion']);
            }
        } else {
            http_response_code(405);
            echo json_encode(['error' => 'Method Not Allowed']);
        }
    } else {
        // Base /api/modules route OR /api/modules/123/students
        if ($request_method === 'GET') {
            $moduleId = isset($uri_parts[$modulesIndex + 1]) ? intval($uri_parts[$modulesIndex + 1]) : null;
            $subAction = isset($uri_parts[$modulesIndex + 2]) ? $uri_parts[$modulesIndex + 2] : null;

            if ($moduleId && $subAction === 'students') {
                $controller->getStudentsByModule($moduleId);
            } else {
                $controller->getModules();
            }
        } elseif ($request_method === 'POST') {
            $controller->createModule();
        } elseif ($request_method === 'DELETE') {
            // Check if there is a module ID
            $moduleId = isset($uri_parts[$modulesIndex + 1]) ? intval($uri_parts[$modulesIndex + 1]) : null;
            if ($moduleId) {
                $controller->deleteModule($moduleId);
            } else {
                http_response_code(400);
                echo json_encode(['error' => 'Module ID required for deletion']);
            }
        } else {
            http_response_code(405);
            echo json_encode(['error' => 'Method Not Allowed']);
        }
    }
} else {
    // 404 Route Not Found
    http_response_code(404);
    echo json_encode(['error' => 'API Route not found']);
}
