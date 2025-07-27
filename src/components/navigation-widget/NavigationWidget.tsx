
.navigation-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.navigation-widget {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 16px;
  width: 90vw;
  height: 85vh;
  max-width: 1000px;
  max-height: 700px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;

  &.loading, &.error {
    height: auto;
    min-height: 200px;
    justify-content: center;
    align-items: center;
  }
}

.navigation-header {
  background: linear-gradient(90deg, #0f3460 0%, #0e4b99 100%);
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;

  .navigation-title {
    flex: 1;
    margin-right: 20px;
    
    h2 {
      margin: 0 0 4px 0;
      color: #ffffff;
      font-size: 1.3em;
      font-weight: 600;
    }

    .navigation-destination {
      color: #b3d9ff;
      font-size: 0.9em;
      display: flex;
      flex-direction: column;
      gap: 2px;
      margin-bottom: 8px;

      .last-updated {
        font-size: 0.8em;
        color: #88c8ff;
        opacity: 0.8;
      }
    }

    .open-maps-button {
      background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
      color: white;
      border: none;
      padding: 8px 12px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.9em;
      transition: all 0.2s ease;
      white-space: nowrap;

      &:hover {
        background: linear-gradient(135deg, #45a049 0%, #3e8e41 100%);
        transform: translateY(-1px);
      }
    }
  }

  .close-button {
    background: rgba(255, 255, 255, 0.1);
    border: none;
    color: #ffffff;
    font-size: 24px;
    cursor: pointer;
    padding: 4px;
    border-radius: 50%;
    transition: all 0.2s ease;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    &:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: scale(1.1);
    }
  }
}

.navigation-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .navigation-container {
    flex: 1;
    position: relative;
    
    .navigation-iframe {
      width: 100%;
      height: 100%;
      border: none;
      background: #1a1a2e;
    }
  }

  .navigation-fallback {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    color: #ffffff;
    padding: 40px;

    .navigation-icon {
      font-size: 3em;
      margin-bottom: 16px;
      opacity: 0.7;
    }

    p {
      margin: 0 0 20px 0;
      font-size: 1.1em;
      opacity: 0.9;
    }

    .fallback-button {
      background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 1em;
      transition: all 0.2s ease;

      &:hover {
        background: linear-gradient(135deg, #45a049 0%, #3e8e41 100%);
        transform: translateY(-2px);
      }
    }
  }
}

.location-info {
  background: rgba(0, 0, 0, 0.3);
  padding: 8px 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: center;

  .location-accuracy {
    color: #88c8ff;
    font-size: 0.8em;
    opacity: 0.8;
  }
}

.loading-spinner {
  display: flex;
  justify-content: center;
  align-items: center;
  color: #ffffff;
  font-size: 1.1em;
  padding: 40px;
}

.error-message {
  display: flex;
  justify-content: center;
  align-items: center;
  color: #ff6b6b;
  font-size: 1.1em;
  padding: 40px;
  text-align: center;
}

@media (max-width: 768px) {
  .navigation-widget {
    width: 95vw;
    height: 90vh;
    max-height: 90vh;
    border-radius: 12px;
    margin: 5vh auto;
  }

  .navigation-backdrop {
    padding: 0;
    justify-content: center;
    align-items: flex-start;
  }

  .navigation-header {
    padding: 12px 16px;
    
    .navigation-title {
      margin-right: 16px;
      
      h2 {
        font-size: 1.2em;
      }

      .navigation-destination {
        font-size: 0.85em;
        
        .last-updated {
          font-size: 0.75em;
        }
      }

      .open-maps-button {
        font-size: 0.85em;
        padding: 6px 10px;
      }
    }

    .close-button {
      width: 36px;
      height: 36px;
      font-size: 20px;
    }
  }

  .navigation-content .navigation-fallback {
    padding: 20px;

    .navigation-icon {
      font-size: 2.5em;
    }

    p {
      font-size: 1em;
    }
  }
}
