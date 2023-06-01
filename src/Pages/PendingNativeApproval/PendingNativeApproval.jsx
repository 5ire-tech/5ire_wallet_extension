import React from "react";
import { closeBoth } from "../../Utility/window.helper";

export default function PendingNativeApproval() {
  const onCancelApproval = () => {
    closeBoth();
  };

  return (
    <div>
      <h4>Your Approval Page is Active</h4>
      <button onClick={onCancelApproval}>Cancel Approval</button>
    </div>
  );
}
