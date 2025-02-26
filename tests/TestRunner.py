import asyncio
import logging
import os
import platform
import sys

import nest_asyncio
from FrontEnd import FrontEndTest


class TestRunner:
    def __init__(self):
        pass

    def run(self):
        test = FrontEndTest(base_uri="http://localhost:1109")
        try:
            if platform.system() == "Linux":
                print("Linux Detected, using asyncio.run")
                if not asyncio.get_event_loop().is_running():
                    try:
                        asyncio.run(test.run())
                    except Exception as e:
                        logging.error(f"Test execution failed: {e}")
                        # Make one final attempt to create video if it doesn't exist
                        if not os.path.exists(os.path.join(os.getcwd(), "report.mp4")):
                            test.create_video_report()
                        sys.exit(1)
                else:
                    try:

                        nest_asyncio.apply()
                        asyncio.get_event_loop().run_until_complete(test.run())
                    except Exception as e:
                        logging.error(f"Test execution failed: {e}")
                        if not os.path.exists(os.path.join(os.getcwd(), "report.mp4")):
                            test.create_video_report()
                        sys.exit(1)
            else:
                print("Windows Detected, using asyncio.ProactorEventLoop")
                loop = asyncio.ProactorEventLoop()
                nest_asyncio.apply(loop)
                try:
                    loop.run_until_complete(test.run(False))
                except Exception as e:
                    logging.error(f"Test execution failed: {e}")
                    if not os.path.exists(os.path.join(os.getcwd(), "report.mp4")):
                        test.create_video_report()
                    sys.exit(1)
                finally:
                    loop.close()
        except Exception as e:
            logging.error(f"Critical failure: {e}")
            # Try one last time to create video even in case of critical failure
            if not os.path.exists(os.path.join(os.getcwd(), "report.mp4")):
                try:
                    test.create_video_report()
                except Exception as video_error:
                    logging.error(f"Failed to create video report: {video_error}")
            sys.exit(1)
