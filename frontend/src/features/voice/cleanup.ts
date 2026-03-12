// voice-refactor/cleanup.ts
import type { Transport, Producer, Consumer } from "mediasoup-client/types";

// AUDIO ELEMENT CLEANUP
export async function cleanupAudioElement(
  audio: HTMLAudioElement,
): Promise<void> {
  try {
    await Promise.race([
      new Promise<void>((resolve) => {
        audio.pause();
        resolve();
      }),
      new Promise<void>((resolve) => setTimeout(resolve, 1000)),
    ]);

    if (audio.srcObject instanceof MediaStream) {
      audio.srcObject.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {
          console.warn("Error stopping track:", e);
        }
      });
    }

    audio.srcObject = null;
    audio.removeAttribute("src");
    audio.muted = true;

    if (audio.parentNode) {
      audio.parentNode.removeChild(audio);
    }
  } catch (e) {
    console.warn("Error cleaning up audio element:", e);
  }
}

// MEDIASTREAM CLEANUP
export function cleanupMediaStream(stream: MediaStream | null): void {
  if (!stream) return;

  stream.getTracks().forEach((track) => {
    try {
      track.stop();
      stream.removeTrack(track);
    } catch (e) {
      console.warn("Error stopping track:", e);
    }
  });
}

// WEBRTC RESOURCE CLEANUP
export function cleanupProducer(producer: Producer | null): void {
  if (!producer) return;

  try {
    const track = producer.track;
    producer.close();
    if (track) {
      track.stop();
    }
  } catch (e) {
    console.warn("Error cleaning up producer:", e);
  }
}

export function cleanupConsumer(consumer: Consumer | null): void {
  if (!consumer) return;

  try {
    const track = consumer.track;
    if (track) {
      track.stop();
    }
    consumer.close();
  } catch (e) {
    console.warn("Error cleaning up consumer:", e);
  }
}

export function cleanupTransport(transport: Transport | null): void {
  if (!transport) return;

  try {
    transport.removeAllListeners();
    transport.close();
  } catch (e) {
    console.warn("Error cleaning up transport:", e);
  }
}

// BATCH CLEANUP
export async function cleanupAllResources(resources: {
  localStream?: MediaStream | null;
  producer?: Producer | null;
  sendTransport?: Transport | null;
  recvTransport?: Transport | null;
  consumers?: Map<number, Consumer>;
  audioElements?: Map<number, HTMLAudioElement>;
}): Promise<void> {
  const cleanupPromises: Promise<void>[] = [];

  if (resources.audioElements) {
    for (const audio of resources.audioElements.values()) {
      cleanupPromises.push(cleanupAudioElement(audio));
    }
    resources.audioElements.clear();
  }

  if (resources.consumers) {
    resources.consumers.forEach((consumer) => {
      cleanupConsumer(consumer);
    });
    resources.consumers.clear();
  }

  if (resources.producer) {
    cleanupProducer(resources.producer);
  }

  if (resources.sendTransport) {
    cleanupTransport(resources.sendTransport);
  }
  if (resources.recvTransport) {
    cleanupTransport(resources.recvTransport);
  }

  if (resources.localStream) {
    cleanupMediaStream(resources.localStream);
  }

  await Promise.race([
    Promise.allSettled(cleanupPromises),
    new Promise((resolve) => setTimeout(resolve, 5000)),
  ]);
}
