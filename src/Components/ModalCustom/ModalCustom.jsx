import { Modal } from "antd";
import React from "react";
import ModalCloseIcon from "../../Assets/ModalCloseIcon.svg";

function ModalCustom({
  isModalOpen,
  handleOk,
  handleCancel,
  children,
  customClass,
  title,
  centered
}) {
  return (
    <div>
      <Modal
        closeIcon={
          <img src={ModalCloseIcon} alt="close" draggable={false} className="closeModalIcon" />
        }
        title={title}
        className={`modalCustom ${customClass}`}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={false}
        centered={centered}>
        {children}
      </Modal>
    </div>
  );
}

export default ModalCustom;
