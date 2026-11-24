import Box from "@mui/material/Box";
import { mainBoxStyles } from "../../theme";

// @flow 
export const Profile = () => {
    return (
        <Box sx={mainBoxStyles}>
            <h1>Profiles</h1>
            Here you can update your info and change password.
            <br />
            But a bit later
        </Box>
    );
};