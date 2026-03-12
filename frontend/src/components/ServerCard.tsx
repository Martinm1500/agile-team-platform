import React, { useEffect, useState } from "react";
import "./ServerCard.css";
import { UsersIcon2 } from "./Icons";
import type {
  Server,
  JoinServerRequest,
} from "../features/servers/serverTypes";
import { useServer } from "../features/servers/useServers";

interface ServerCardProps {
  server: Server;
}

const optimizeImage = (url: string, width = 400, quality = 70): string => {
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}w=${width}&q=${quality}&auto=format`;
};

const ServerCard: React.FC<ServerCardProps> = React.memo(({ server }) => {
  const {
    joinServer,
    requestJoinServer,
    serversById,
    getOutgoingJoinRequests,
  } = useServer();
  const [outgoingRequests, setOutgoingRequests] = useState<JoinServerRequest[]>(
    []
  );
  const [isLoadingRequests, setIsLoadingRequests] = useState(true);

  useEffect(() => {
    getOutgoingJoinRequests()
      .unwrap()
      .then((requests) => {
        setOutgoingRequests(requests);
        setIsLoadingRequests(false);
      })
      .catch(() => {
        setIsLoadingRequests(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isMember = !!serversById[server.id];

  const hasPendingRequest = outgoingRequests.some(
    (req) => req.serverId === server.id
  );

  const handleJoin = () => {
    joinServer(server.id);
  };

  const handleRequestJoin = async () => {
    await requestJoinServer(server.id);
    // Refetch after sending request
    getOutgoingJoinRequests()
      .unwrap()
      .then((requests) => {
        setOutgoingRequests(requests);
      });
  };

  if (isLoadingRequests) {
    return <div>Loading...</div>; // Or some placeholder
  }

  return (
    <div className="server-preview-card">
      <div className="server-banner-container">
        <img
          src={optimizeImage(server.bannerUrl)}
          alt={`${server.name} banner`}
          className="server-banner"
          loading="lazy"
        />
        <div className="server-avatar-container">
          <img
            src={optimizeImage(server.avatarUrl, 100)}
            alt={server.name}
            className="server-avatar"
            loading="lazy"
          />
        </div>
      </div>

      <div className="server-card-content">
        <h3 className="server-name">{server.name}</h3>
        <p className="server-description">{server.description}</p>

        <div className="server-stats">
          <div className="stat-item">
            <UsersIcon2 className="users-icon" />
            <span>{server.membersCount?.toLocaleString() || 0}</span>
            Members
          </div>
          <div className="stat-item online">
            <span className="status"></span>
            <span>{server.membersCount?.toLocaleString() || 0}</span>
            Online
          </div>
        </div>

        {server.privacy === "PUBLIC" && !isMember && (
          <button className="join-button" onClick={handleJoin}>
            Join Server
          </button>
        )}
        {server.privacy === "DEFAULT" && !isMember && !hasPendingRequest && (
          <button className="join-button" onClick={handleRequestJoin}>
            Request to Join
          </button>
        )}
      </div>
    </div>
  );
});

export default ServerCard;
