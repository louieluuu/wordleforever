import React, { useEffect } from 'react'


function AlertModal({ showAlertModal, setShowAlertModal, message }) {
    let alertTimeout
  
    useEffect(() => {
      if (showAlertModal) {
        alertTimeout = setTimeout(() => {
          setShowAlertModal(false)
        }, 1500)
      }
  
      return () => {
        clearTimeout(alertTimeout)
      }
    }, [showAlertModal, setShowAlertModal])
  
    return (
        <div
            className={`alert-modal${showAlertModal ? "" : " hide"}`}>
            {message}
        </div>
      )
  }
  
  export default AlertModal