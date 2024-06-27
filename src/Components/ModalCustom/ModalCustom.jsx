import { Modal } from "antd";
import React from "react";
import { CloseIcon } from "../../Assets/StoreAsset/StoreAsset";

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
        closeIcon={<CloseIcon />}
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
