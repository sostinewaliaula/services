import { useRef, useEffect } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

export function useTour(onOpenModal?: () => void, onCloseModal?: () => void) {
    const driverObj = useRef<any>(null);
    const hasStarted = useRef(false);

    useEffect(() => {
        const hasSeenTour = localStorage.getItem('has_seen_tour');

        if (!hasSeenTour && !hasStarted.current) {
            // Wait for mounting
            setTimeout(() => {
                startTour();
            }, 1000);
        }
    }, [onOpenModal, onCloseModal]);

    const startTour = () => {
        hasStarted.current = true;

        driverObj.current = driver({
            showProgress: true,
            animate: true,
            allowClose: true,
            doneBtnText: 'Finish',
            nextBtnText: 'Next',
            prevBtnText: 'Previous',
            onDestroyed: () => {
                localStorage.setItem('has_seen_tour', 'true');
                if (onCloseModal) onCloseModal();
            },
            steps: [
                {
                    element: '#header-logo',
                    popover: {
                        title: 'Welcome to Service Hub',
                        description: 'Your central directory for all infrastructure services. Let\'s take a quick look around.',
                        side: 'bottom',
                        align: 'start'
                    }
                },
                {
                    element: '#header-search',
                    popover: {
                        title: 'Global Search',
                        description: 'Quickly find what you need by name, IP, or URL from anywhere in the app.',
                        side: 'bottom'
                    }
                },
                {
                    element: '#search-filter-area',
                    popover: {
                        title: 'Filters',
                        description: 'Narrow down your view by Category, Environment, and more to find specific services.',
                        side: 'bottom'
                    }
                },
                {
                    element: '#featured-section',
                    popover: {
                        title: 'Featured Services',
                        description: 'Critical and frequently used services are pinned here for instant access.',
                        side: 'bottom'
                    }
                },
                {
                    element: '#service-grid .service-card:first-child',
                    popover: {
                        title: 'Service Cards',
                        description: 'Click anywhere on a card to view full details. You can also Launch or Download configuration directly from here.',
                        side: 'right',
                        align: 'center',
                        onNextClick: () => {
                            if (onOpenModal) {
                                onOpenModal();
                                // Small delay to allow modal to open/render
                                setTimeout(() => {
                                    driverObj.current.moveNext();
                                }, 300);
                            } else {
                                driverObj.current.moveNext();
                            }
                        }
                    }
                },
                {
                    element: '#modal-general-info',
                    popover: {
                        title: 'Detailed View',
                        description: 'Here you can see the Environment, Category, Team, and IP details at a glance.',
                        side: 'right',
                        onPrevClick: () => {
                            if (onCloseModal) onCloseModal();
                            driverObj.current.movePrevious();
                        }
                    }
                },
                {
                    element: '#modal-actions',
                    popover: {
                        title: 'Launch & Download',
                        description: 'Directly launch the service in a new tab or download its configuration file.',
                        side: 'top'
                    }
                },
                {
                    element: '#modal-credentials',
                    popover: {
                        title: 'Credentials & Access',
                        description: 'View database strings and passwords. Click the copy icon to instantly copy any value to your clipboard.',
                        side: 'top',
                        onNextClick: () => {
                            if (onCloseModal) onCloseModal();
                            driverObj.current.moveNext();
                        }
                    }
                },
                {
                    element: '#theme-toggle-container',
                    popover: {
                        title: 'Theme & Settings',
                        description: 'Toggle between Light, Dark, and System themes to match your preference.',
                        side: 'bottom',
                        align: 'end'
                    }
                }
            ]
        });

        driverObj.current.drive();
    };

    return { startTour };
}
