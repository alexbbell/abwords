import { createTheme, SxProps, Theme } from "@mui/material";
export const theme = createTheme({
    components: {

        MuiTextField: {
            defaultProps: {
                fullWidth: true
            },
            styleOverrides: {
                root: {
                },


            },
        },

        MuiInputBase: {
            styleOverrides: {
                root: {
                    backgroundColor: '#FFF',
                },
                inputHiddenLabel: {
                    color: '#F0F'
                },
                hiddenLabel: {
                    color: '#F0F'
                },
                input: {
                    // Styles for the input text
                    color: "#333", // Text color
                    fontSize: "16px", // Font size
                    padding: "5px", // Padding inside the input
                    "&::placeholder": {
                        color: "#888", // Placeholder text color
                        fontSize: "12px", // Font size
                        opacity: 1, // Ensures opacity is not affected
                    },
                },
            },
        },


        MuiFormControlLabel: {
            styleOverrides: {
                root: {
                    background: '#FFF',
                    visibility: 'visible',
                    color: '#F0F'
                }
            }
        },
        MuiFormHelperText: {
            styleOverrides: {
              root: {
                visibility: "visible", // Ensures helper text is always visible
                color: "#F0F", // Helper text color
                fontSize: "12px", // Helper text font size
                marginTop: "4px", // Space between input and helper text
              },
            },
          },
        MuiSelect: {
            styleOverrides: {
                root: {
                    background: '#FFF'
                }
            }
        },
        MuiDialog: {
            styleOverrides: {
                root: {
                    padding: 0,
                    margin: 0
                },
                paper: {
                    backgroundImage: 'none', 
                    background: '#FFF',
                    color: '#999',
                    padding:  0
                }
            }
        },


        MuiFormLabel: {
            styleOverrides: {
                root: {
                    color: '#F0F'
                }
            }
        },
        MuiInputLabel: {
            styleOverrides: {
                root: {
                    color: '#F0F',
                    visibility: 'visible'

                }
            }
        },
        MuiDialogContentText: {
            styleOverrides: {
                root: {
                    color: '#999'
                }
            }

        }
    }

});


export const dialogTheme: SxProps<Theme>  = {
     display: 'flex', flexDirection: 'column',
     gap: 2,
     border: '#FFF 0px solid',
     color: '#FFF'
}

export const mainBoxStyles: SxProps<Theme> = {
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  
  alignItems: 'flex-start', // Note: standard CSS value is 'flex-start' instead of 'start'
  justifyContent: 'start',
  bgcolor: 'background.default',
  py: { xs: 4, md: 8 },
  px: 2,
};