'use client';

import { useCallback, useEffect, useState } from 'react';

interface SidebarState {
    [key: string]: boolean;
}

export function useSidebarState(defaultState: SidebarState = {}) {
    const [collapsedSections, setCollapsedSections] = useState<SidebarState>(defaultState);

    const toggleSection = useCallback((sectionId: string) => {
        setCollapsedSections((prev) => ({
            ...prev,
            [sectionId]: !prev[sectionId],
        }));
    }, []);

    const setSectionState = useCallback((sectionId: string, isOpen: boolean) => {
        setCollapsedSections((prev) => ({
            ...prev,
            [sectionId]: isOpen,
        }));
    }, []);

    const isSectionOpen = useCallback(
        (sectionId: string, defaultOpen = false) => {
            return collapsedSections[sectionId] ?? defaultOpen;
        },
        [collapsedSections],
    );

    // Persist state to localStorage
    useEffect(() => {
        const savedState = localStorage.getItem('sidebar-state');
        if (savedState) {
            try {
                setCollapsedSections(JSON.parse(savedState));
            } catch {
                console.warn('Failed to parse saved sidebar state');
            }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('sidebar-state', JSON.stringify(collapsedSections));
    }, [collapsedSections]);

    return {
        toggleSection,
        setSectionState,
        isSectionOpen,
        collapsedSections,
    };
}
