import { Button } from "@mui/material";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axiosInstance from "~/utils/axiosConfig";

function Dashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axiosInstance.get("/v1/dashboards/access");
        console.log(res.data);
        setUser(res.data);
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
      await axiosInstance.delete("/v1/users/logout");
      localStorage.removeItem("userInfo");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || error?.message);
    }
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
      <Button variant="contained" color="primary" onClick={handleLogout}>
        Logout
      </Button>
    </Box>
  );
}

export default Dashboard;
