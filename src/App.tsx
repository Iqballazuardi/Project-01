import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
    BrowserRouter as Router,
    Route,
    Routes,
    Navigate,
    useNavigate,
} from "react-router-dom";
import { Provider, useDispatch, useSelector } from "react-redux";
import { configureStore, createSlice, PayloadAction } from "@reduxjs/toolkit";
import Cookies from "js-cookie";
import "./index.css";
import Swal from "sweetalert2";

// Tipe untuk state auth
interface User {
    username: string;
    password: string;
}

interface AuthState {
    users: User[];
    currentUser: User | null;
}

// Redux Slice untuk Autentikasi
const authSlice = createSlice({
    name: "auth",
    initialState: {
        users: [{ username: "admin", password: "1234" }],
        currentUser: null,
    } as AuthState,
    reducers: {
        login: (state, action: PayloadAction<User>) => {
            console.log(state);
            console.log(action);
            const users = JSON.parse(localStorage.getItem("users") || "[]");
            state.users.push(...users);
            const user = state.users.find(
                (u: User) =>
                    u.username === action.payload.username &&
                    u.password === action.payload.password
            );
            if (user) {
                state.currentUser = user;
                localStorage.setItem("currentUser", JSON.stringify(user));
                // Cookies.set("LoginTimeout", "true", { expires: 1 / 1440 });
                const inFifteenMinutes = new Date(
                    new Date().getTime() + 1 * 60 * 1000
                );
                Cookies.set("LoginTimeout", "true", {
                    expires: inFifteenMinutes,
                });
            }
        },
        register: (state, action: PayloadAction<User>) => {
            state.users.push(action.payload);
            localStorage.setItem("users", JSON.stringify(state.users));
        },
        logout: (state) => {
            state.currentUser = null;
        },
        updateStateFromStorage: (state) => {
            const users = JSON.parse(localStorage.getItem("users") || "[]");
            state.users.push(...users);
            const user = JSON.parse(
                localStorage.getItem("currentUser") || "null"
            );
            state.currentUser = user;
        },
    },
});

const store = configureStore({
    reducer: { auth: authSlice.reducer },
});
const { login, logout, register, updateStateFromStorage } = authSlice.actions;

type RootState = ReturnType<typeof store.getState>;

// Komponen Login
const Login = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const {
        register: formRegister,
        handleSubmit,
        formState: { errors },
    } = useForm<User>();
    const users = useSelector((state: RootState) => state.auth.users);

    useEffect(() => {
        if (Cookies.get("LoginTimeout")) {
            navigate("/");
        }
    }, [navigate]);

    const onSubmit = (data: User) => {
        const userExists = users.some(
            (user) =>
                user.username === data.username &&
                user.password === data.password
        );
        if (userExists) {
            dispatch(login(data));
            Swal.fire({
                title: "Success!",
                text: "Login success!",
                icon: "success",
                confirmButtonText: "Cool",
            });
            navigate("/");
        } else {
            Swal.fire({
                title: "Error!",
                text: "Username atau password salah",
                icon: "error",
                confirmButtonText: "Cool",
            });
        }
    };

    return (
        <div className="container">
            <h2> Halaman Login</h2>.
            {/* {error && (
                <div
                    className="p-4 mb-4 text-sm text-blue-800 rounded-lg bg-blue-50 dark:bg-gray-800 dark:text-blue-400"
                    role="alert"
                >
                    <span className="font-medium">{error}</span>
                </div>
            )} */}
            <form onSubmit={handleSubmit(onSubmit)}>
                <input
                    {...formRegister("username", {
                        required: "Username wajib diisi",
                    })}
                    type="text"
                    placeholder="Username"
                />
                {errors.username && <p>{errors.username.message}</p>}
                <input
                    {...formRegister("password", {
                        required: "Password wajib diisi",
                        minLength: { value: 4, message: "Minimal 4 karakter" },
                    })}
                    type="password"
                    placeholder="Password"
                />
                {errors.password && <p>{errors.password.message}</p>}
                <div>
                    <button type="submit">Login</button>
                </div>
            </form>
            <div>
                <p>Belum punya akun?</p>
                <button onClick={() => navigate("/register")}>Daftar</button>
            </div>
        </div>
    );
};

// Komponen Register
const Register = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const {
        register: formRegister,
        handleSubmit,
        formState: { errors },
    } = useForm<User>();

    const onSubmit = (data: User) => {
        const userExists = JSON.parse(
            localStorage.getItem("users") || "[]"
        ).some((user: User) => user.username === data.username);
        if (userExists) {
            Swal.fire({
                title: "Error!",
                text: "Username sudah terdaftar",
                icon: "error",
                confirmButtonText: "Cool",
            });
            return;
        }
        dispatch(register(data));
        Swal.fire({
            title: "Success!",
            text: "Register berhasil, silahkan login",
            icon: "success",
            confirmButtonText: "Cool",
        });
        navigate("/login");
    };

    return (
        <div className="container">
            <h2>Halaman Register</h2>
            <form onSubmit={handleSubmit(onSubmit)}>
                <input
                    {...formRegister("username", {
                        required: "Username wajib diisi",
                    })}
                    type="text"
                    placeholder="Username"
                />
                {errors.username && <p>{errors.username.message}</p>}
                <input
                    {...formRegister("password", {
                        required: "Password wajib diisi",
                        minLength: { value: 4, message: "Minimal 4 karakter" },
                    })}
                    type="password"
                    placeholder="Password"
                />
                {errors.password && <p>{errors.password.message}</p>}
                <button type="submit">Daftar</button>
            </form>
        </div>
    );
};

// Komponen Home
const Home = () => {
    const user = useSelector((state: RootState) => state.auth.currentUser);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    React.useEffect(() => {
        const loginTimeout = () => {
            if (!Cookies.get("LoginTimeout")) {
                Cookies.remove("LoginTimeout");
                dispatch(logout());
                navigate("/login");
            }
        };
        const interval = setInterval(loginTimeout, 1000);
        return () => clearInterval(interval);
    }, [dispatch, navigate]);

    return user ? (
        <div className="container">
            <h2>Selamat Datang, {user.username}</h2>
            <button
                onClick={() => {
                    dispatch(logout());
                    Cookies.remove("LoginTimeout");
                    navigate("/login");
                }}
            >
                Logout
            </button>
        </div>
    ) : (
        <Navigate to="/login" />
    );
};

// Komponen NotFound
const NotFound = () => {
    return (
        <div className="container">
            <h2>404 - Halaman Tidak Ditemukan</h2>
        </div>
    );
};

// Komponen Utama Aplikasi
const App = () => {
    const dispatch = useDispatch();
    React.useEffect(() => {
        dispatch(updateStateFromStorage());
    }, [dispatch]);
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </Router>
    );
};

const AppWrapper = () => {
    return (
        <Provider store={store}>
            <App />
        </Provider>
    );
};
export default AppWrapper;
