import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Typography from "@mui/material/Typography";
import SecurityIcon from "@mui/icons-material/Security";
import CancelIcon from "@mui/icons-material/Cancel";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { get2FA_QRCode, setup2FA } from "~/apis";
import { CircularProgress } from "@mui/material";

function Setup2FA({ isOpen, toggleOpen, user, handleSuccess }) {
  const [otpToken, setConfirmOtpToken] = useState("");
  const [error, setError] = useState(null);
  const [qr2FA, setQr2FA] = useState(null);

  const handleCloseModal = () => {
    toggleOpen(!isOpen);
    setQr2FA(null);
  };

  const handleConfirmSetup2FA = () => {
    if (!otpToken) {
      const errMsg = "Please enter your otp token.";
      setError(errMsg);
      toast.error(errMsg);
      return;
    }
    setup2FA(user._id, otpToken).then((response) => {
      toast.success("Setup 2FA successfully!");
      handleSuccess && handleSuccess(response?.data?.data);
      handleCloseModal();
    });
  };

  useEffect(() => {
    if (isOpen) {
      get2FA_QRCode(user._id).then((response) => {
        setQr2FA(response.data?.data?.qrCodeImage);
      });
    }
  }, [isOpen]);

  return (
    <Modal disableScrollLock open={isOpen} sx={{ overflowY: "auto" }}>
      <Box
        sx={{
          position: "relative",
          maxWidth: 700,
          bgcolor: "white",
          boxShadow: 24,
          borderRadius: "8px",
          border: "none",
          outline: 0,
          padding: "40px 20px 20px",
          margin: "120px auto",
          backgroundColor: (theme) =>
            theme.palette.mode === "dark" ? "#1A2027" : "#fff"
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: "12px",
            right: "10px",
            cursor: "pointer"
          }}
        >
          <CancelIcon
            color="error"
            sx={{ "&:hover": { color: "error.light" } }}
            onClick={handleCloseModal}
          />
        </Box>

        <Box
          sx={{
            mb: 1,
            mt: -3,
            pr: 2.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1
          }}
        >
          <SecurityIcon sx={{ color: "#27ae60" }} />
          <Typography
            variant="h6"
            sx={{ fontWeight: "bold", color: "#27ae60" }}
          >
            Setup 2FA (Two-Factor Authentication)
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
            p: 1
          }}
        >
          {qr2FA ? (
            <img
              style={{ width: "100%", maxWidth: "250px", objectFit: "contain" }}
              src={qr2FA ?? ""}
              alt="card-cover"
            />
          ) : (
            <CircularProgress />
          )}

          <Box sx={{ textAlign: "center" }}>
            Quét mã QR trên ứng dụng <strong>Google Authenticator</strong> hoặc{" "}
            <strong>Authy</strong> của bạn.
            <br />
            Sau đó nhập mã gồm 6 chữ số và click vào <strong>Confirm</strong> để
            xác nhận.
          </Box>

          <Box
            sx={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
              my: 1
            }}
          >
            <TextField
              autoFocus
              autoComplete="nope"
              label="Enter your code..."
              type="text"
              variant="outlined"
              sx={{ minWidth: "280px" }}
              value={otpToken}
              onChange={(e) => setConfirmOtpToken(e.target.value)}
              error={!!error && !otpToken}
            />

            <Button
              type="button"
              variant="contained"
              color="primary"
              size="large"
              sx={{
                textTransform: "none",
                minWidth: "120px",
                height: "55px",
                fontSize: "1em"
              }}
              onClick={handleConfirmSetup2FA}
            >
              Confirm
            </Button>
          </Box>
        </Box>
      </Box>
    </Modal>
  );
}

export default Setup2FA;
