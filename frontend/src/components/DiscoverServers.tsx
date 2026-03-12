import React, { useState, useEffect, useMemo } from "react";
import { useServer } from "../features/servers/useServers";
import ServerCard from "./ServerCard";
import { SearchIcon } from "./Icons";
import "./DiscoverServers.css";
import type { Server } from "../features/servers/serverTypes";

interface DiscoverServersProps {
  onClose?: () => void;
}

const DiscoverServers: React.FC<DiscoverServersProps> = React.memo(() => {
  const { discoverServers } = useServer();
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [servers, setServers] = useState<Server[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServers = async () => {
      try {
        const data = await discoverServers();
        setServers(data);
      } catch (err) {
        console.log(err);
        setError("Error al obtener servidores públicos");
      } finally {
        setIsLoading(false);
      }
    };

    fetchServers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  const filteredServers = useMemo(() => {
    return servers.filter(
      (server) =>
        server.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        server.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [servers, searchQuery]);

  return (
    <div className="discover-servers-container">
      <div className="discover-servers-header">
        <h2>Discover</h2>
        <input
          type="text"
          placeholder="Search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-server-input"
          aria-label="Search servers"
        />
        <SearchIcon className="search-icon" />
      </div>

      <div className="servers-view">
        <div className="servers-grid">
          {isLoading ? (
            <div className="loading-servers">
              <i className="fas fa-spinner fa-spin" />
              <span>Loading communities...</span>
            </div>
          ) : error ? (
            <div className="no-results">
              <i className="fas fa-exclamation-triangle" />
              <p>{error}</p>
            </div>
          ) : filteredServers.length > 0 ? (
            filteredServers.map((server) => (
              <ServerCard key={server.id} server={server} />
            ))
          ) : (
            <div className="no-results">
              <i className="fas fa-search" />
              <p>No communities found matching "{searchQuery}"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default DiscoverServers;
