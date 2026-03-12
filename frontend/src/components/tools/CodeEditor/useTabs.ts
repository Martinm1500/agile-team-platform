import { useState, useCallback, useRef } from "react";
import type { Tab } from "./CodeEditorTypes";

const useTabs = (initialTabs: Tab[] = []) => {
  const [tabs, setTabs] = useState<Tab[]>(initialTabs);
  const [activeTab, setActiveTab] = useState<string>("");
  const [isRenaming, setIsRenaming] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const tabsRef = useRef<HTMLDivElement>(null);

  const handleTabChange = useCallback((tabId: string) => {
    setActiveTab(tabId);
    setIsRenaming(null);
  }, []);

  const addNewTab = useCallback(() => {
    const newTab: Tab = {
      id: Date.now().toString(),
      name: `new-file-${tabs.length + 1}.js`,
      language: "javascript",
      content: "// Start coding here...\n",
    };
    setTabs((prevTabs) => [...prevTabs, newTab]);
    setActiveTab(newTab.id);

    setTimeout(() => {
      tabsRef.current?.scrollTo({
        left: tabsRef.current.scrollWidth,
        behavior: "smooth",
      });
    }, 0);

    return newTab;
  }, [tabs.length]);

  const closeTab = useCallback(
    (tabId: string) => {
      setTabs((prevTabs) => {
        const newTabs = prevTabs.filter((tab) => tab.id !== tabId);
        if (activeTab === tabId && newTabs.length > 0) {
          setActiveTab(newTabs[newTabs.length - 1].id);
        } else if (newTabs.length === 0) {
          setActiveTab("");
        }
        return newTabs;
      });
      setIsRenaming(null);
    },
    [activeTab]
  );

  const renameTab = useCallback(
    (tabId: string) => {
      const tab = tabs.find((t) => t.id === tabId);
      if (tab) {
        setNewName(tab.name);
        setIsRenaming(tabId);
      }
    },
    [tabs]
  );

  const confirmRename = useCallback(() => {
    if (isRenaming && newName.trim()) {
      setTabs((prevTabs) =>
        prevTabs.map((tab) =>
          tab.id === isRenaming ? { ...tab, name: newName.trim() } : tab
        )
      );
    }
    setIsRenaming(null);
  }, [isRenaming, newName]);

  return {
    tabs,
    activeTab,
    isRenaming,
    newName,
    tabsRef,
    handleTabChange,
    addNewTab,
    closeTab,
    renameTab,
    confirmRename,
    setTabs,
    setNewName,
    setActiveTab,
  };
};

export default useTabs;
