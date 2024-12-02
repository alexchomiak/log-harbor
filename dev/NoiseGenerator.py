# * Generate randomized JSON Logs

import json
import random
import time
NUM_THREADS = 2
from concurrent.futures import ThreadPoolExecutor

def generate_noise():
    while True:
        # * Randomize noise between ERROR, WARN, INFO, DEBUG
        log_level = random.choice(['ERROR', 'WARN', 'INFO', 'DEBUG'])
        log_message_map = {
            "ERROR": "Exception handling being awesome",
            "WARN": "Warning: This is a warning message",
            "INFO": "Information: This is an information message. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam nec purus nec nunc ultricies ultricies. Nullam nec purus nec nunc ultricies ultricies. Nullam nec purus nec nunc. Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s",
            "DEBUG": "Debugging: This is a debugging message"
        }

        log = {
            "level": log_level,
            "message": log_message_map[log_level],
            "random_number": random.randint(1, 100),
            "random_boolean": random.choice([True, False]),
            "random_color": random.choice(["red", "blue", "green", "yellow", "purple"])
        }
        print(json.dumps(log))
        time.sleep(0.5)

executor = ThreadPoolExecutor(max_workers=NUM_THREADS)
for i in range(NUM_THREADS):
    executor.submit(generate_noise)

