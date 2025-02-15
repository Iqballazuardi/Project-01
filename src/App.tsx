import React from "react";
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
import "./index.css";

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
            const user = state.users.find(
                (u) =>
                    u.username === action.payload.username &&
                    u.password === action.payload.password
            );
            if (user) {
                state.currentUser = user;
            }
        },
        register: (state, action: PayloadAction<User>) => {
            state.users.push(action.payload);
        },
        logout: (state) => {
            state.currentUser = null;
        },
    },
});

const store = configureStore({
    reducer: { auth: authSlice.reducer },
});
const { login, logout, register } = authSlice.actions;

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

    const onSubmit = (data: User) => {
        console.log(data);

        // const userExists = users.some(
        //     (user) =>
        //         user.username === data.username &&
        //         user.password === data.password
        // );
        // if (userExists) {
        //     dispatch(login(data));
        //     navigate("/");
        // } else {
        //     navigate("/register");
        // }
    };

    return (
        <div className="container">
            <h2>Halaman Login</h2>
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
        dispatch(register(data));
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

    return user ? (
        <div className="container">
            <h2>Selamat Datang, {user.username}</h2>
            <button
                onClick={() => {
                    dispatch(logout());
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
    return (
        <Provider store={store}>
            <Router>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </Router>
        </Provider>
    );
};

export default App;
