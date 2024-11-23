import { Card as MuiCard } from "@mui/material";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CardActions from "@mui/material/CardActions";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Zoom from "@mui/material/Zoom";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import axiosInstance from "~/utils/axiosConfig";
import { useNavigate } from "react-router-dom";

function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

  const navigate = useNavigate();

  const submitLogIn = async (data) => {
    try {
      const res = await axiosInstance.post("/v1/users/login", data);
      const user = res?.data?.data;
      const userInfo = {
        id: user._id,
        email: user.email,
        isEnable2FA: user.enable_2fa
      };
      localStorage.setItem("userInfo", JSON.stringify(userInfo));
      localStorage.setItem("accessToken", JSON.stringify(user.accessToken));
      localStorage.setItem("refreshToken", JSON.stringify(user.refreshToken));
      navigate("/dashboard");
    } catch (error) {
      toast.error(error);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        alignItems: "center",
        justifyContent: "flex-start",
        // eslint-disable-next-line quotes
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundPosition: "center",
        boxShadow: "inset 0 0 0 2000px rgba(0, 0, 0, 0.4)"
      }}
    >
      <form onSubmit={handleSubmit(submitLogIn)}>
        <Zoom in={true} style={{ transitionDelay: "200ms" }}>
          <MuiCard
            sx={{
              minWidth: 380,
              maxWidth: 380,
              marginTop: "6em",
              p: "0.5em 0",
              borderRadius: 2
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                color: (theme) => theme.palette.grey[500]
              }}
            >
              <Box>
                <Typography>Hint: khai.dev27@gmail.com</Typography>
                <Typography>Pass: 123456789</Typography>
              </Box>
            </Box>
            <Box sx={{ padding: "0 1em 1em 1em" }}>
              <Box sx={{ marginTop: "1.2em" }}>
                <TextField
                  autoFocus
                  fullWidth
                  label="Enter Email..."
                  type="text"
                  variant="outlined"
                  error={!!errors.email}
                  {...register("email", {
                    required: "This field is required."
                  })}
                />
                {errors.email && (
                  <Alert
                    severity="error"
                    sx={{
                      mt: "0.7em",
                      ".MuiAlert-message": { overflow: "hidden" }
                    }}
                  >
                    {errors.email.message}
                  </Alert>
                )}
              </Box>

              <Box sx={{ marginTop: "1em" }}>
                <TextField
                  fullWidth
                  label="Enter Password..."
                  type="password"
                  variant="outlined"
                  error={!!errors.password}
                  {...register("password", {
                    required: "This field is required."
                  })}
                />
                {errors.password && (
                  <Alert
                    severity="error"
                    sx={{
                      mt: "0.7em",
                      ".MuiAlert-message": { overflow: "hidden" }
                    }}
                  >
                    {errors.password.message}
                  </Alert>
                )}
              </Box>
            </Box>
            <CardActions sx={{ padding: "0.5em 1em 1em 1em" }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                fullWidth
              >
                Login
              </Button>
            </CardActions>
          </MuiCard>
        </Zoom>
      </form>
    </Box>
  );
}

export default Login;
