import React, { useEffect, useRef, useState } from "react";
import "./cameraPopup.css";

const CameraPopup = ({ onClose, onConfirmCapture }) => {
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [capturedVideo, setCapturedVideo] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isVideoMode, setIsVideoMode] = useState(false); // Switch between photo and video mode

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: isVideoMode,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        setIsStreaming(true);
      } catch (err) {
        console.error("Error accessing camera: ", err);
        onClose();
      }
    };

    startCamera();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject;
        const tracks = stream.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, [onClose, isVideoMode]);

  const handleCapture = () => {
    if (videoRef.current && !isVideoMode) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const imageDataUrl = canvas.toDataURL("image/png");
      setCapturedImage(imageDataUrl);
    }
  };

  const handleStartRecording = () => {
    if (!isRecording && videoRef.current) {
      const options = { mimeType: "video/webm" };
      const mediaRecorder = new MediaRecorder(videoRef.current.srcObject, options);
      mediaRecorderRef.current = mediaRecorder;
      let chunks = [];
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        const videoURL = URL.createObjectURL(blob);
        setCapturedVideo(videoURL);
        chunks = [];
      };
      mediaRecorder.start();
      setIsRecording(true);
    }
  };

  const handleStopRecording = () => {
    if (isRecording && mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleSend = () => {
    if (capturedImage) {
      onConfirmCapture({ type: "image", src: capturedImage });
    } else if (capturedVideo) {
      onConfirmCapture({ type: "video", src: capturedVideo });
    }
    onClose(); // Close the camera popup after sending
  };

  const handleDelete = () => {
    setCapturedImage(null);
    setCapturedVideo(null);
  };

  const handleModeSwitch = () => {
    setIsVideoMode(!isVideoMode);
    setCapturedImage(null);
    setCapturedVideo(null);
  };

  return (
    <div className="camera-popup">
      {isStreaming && !capturedImage && !capturedVideo ? (
        <>
          <video ref={videoRef} className="video-stream" />
          <div className="camera-controls">
            {!isRecording && (
              <button className="capture-button" onClick={handleCapture} disabled={isVideoMode}>
                <i className="fas fa-camera"></i>
              </button>
            )}
            {!isRecording && isVideoMode && (
              <button className="record-button" onClick={handleStartRecording}>
                <i className="fas fa-video"></i>
              </button>
            )}
            {isRecording && isVideoMode && (
              <button className="stop-recording-button" onClick={handleStopRecording}>
                <i className="fas fa-stop"></i>
              </button>
            )}
            <button className="close-button" onClick={onClose}>
              <i className="fas fa-times"></i>
            </button>
            <button className="switch-button" onClick={handleModeSwitch}>
              <i className={isVideoMode ? "fas fa-camera" : "fas fa-video"}></i>
            </button>
          </div>
        </>
      ) : capturedImage ? (
        <div className="confirm-capture">
          <img src={capturedImage} alt="Captured" className="captured-image" />
          <div className="confirmation-buttons">
            <button className="send-button" onClick={handleSend}>
              Send
            </button>
            <button className="delete-button" onClick={handleDelete}>
              Delete
            </button>
          </div>
        </div>
      ) : capturedVideo ? (
        <div className="confirm-capture">
          <video controls src={capturedVideo} className="captured-video"></video>
          <div className="confirmation-buttons">
            <button className="send-button" onClick={handleSend}>
              Send
            </button>
            <button className="delete-button" onClick={handleDelete}>
              Delete
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default CameraPopup;
 