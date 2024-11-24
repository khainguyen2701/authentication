import { Button } from "@mui/material";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { logoutApi } from "~/apis";
import Setup2FA from "~/components/Setup2FA";
import axiosInstance from "~/utils/axiosConfig";

function Dashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const [openSetup2FA, setOpenSetup2FA] = useState(false);

  useEffect(() => {
    const id = JSON.parse(localStorage.getItem("userInfo"))?.id;
    const fetchData = async () => {
      try {
        const res = await axiosInstance.get(`/v1/users/profile/${id}`);
        setUser(res.data?.data);
      } catch (error) {
        toast.error(error.response?.data?.message || error?.message);
      }
    };
    fetchData();
  }, []);

  if (!user) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
          width: "100vw",
          height: "100vh"
        }}
      >
        <CircularProgress />
        <Typography>Loading dashboard user...</Typography>
      </Box>
    );
  }

  const handleLogout = async () => {
    try {
      await logoutApi();
      setUser(null);
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || error?.message);
    }
  };

  const handleSuccess2FA = (userUpdated) => {
    setUser(userUpdated);
    localStorage.setItem("userInfo", JSON.stringify(userUpdated));
    setOpenSetup2FA(false);
  };

  return (
    <Box
      sx={{
        marginTop: "1em",
        display: "flex",
        justifyContent: "center",
        flexDirection: "column",
        padding: "0 1em"
      }}
    >
      <Alert
        severity="info"
        sx={{ ".MuiAlert-message": { overflow: "hidden" } }}
      >
        Đây là trang Dashboard sau khi user:&nbsp;
        <Typography
          variant="span"
          sx={{ fontWeight: "bold", "&:hover": { color: "#fdba26" } }}
        >
          {user?.email}
        </Typography>
        &nbsp; đăng nhập thành công thì mới cho truy cập vào.
      </Alert>

      <Divider sx={{ my: 2 }} />
      <Box sx={{ display: "flex", gap: "16px", justifyContent: "flex-end" }}>
        {!user.enable_2fa && (
          <Button
            type="button"
            variant="contained"
            color="warning"
            onClick={() => setOpenSetup2FA(true)}
          >
            Enable 2FA
          </Button>
        )}
        <Button variant="contained" color="primary" onClick={handleLogout}>
          Logout
        </Button>
      </Box>
      <Setup2FA
        isOpen={openSetup2FA}
        toggleOpen={setOpenSetup2FA}
        user={user}
        handleSuccess={handleSuccess2FA}
      />
    </Box>
  );
}

export default Dashboard;
