import { Modal } from 'antd'
import React from 'react'
import ModalCloseIcon from '../../Assets/ModalCloseIcon.svg'

function ModalCustom({
  isModalOpen,
  handleOk,
  handleCancel,
  children,
  customClass,
  title,
}) {
  return (
    <div>
      <Modal
        closeIcon={<img src={ModalCloseIcon} alt='close' draggable={false} />}
        title={title}
        className={`modalCustom ${customClass && customClass}`}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={false}
        centered
      >
        {children}
      </Modal>
    </div>
  )
}

export default ModalCustom
