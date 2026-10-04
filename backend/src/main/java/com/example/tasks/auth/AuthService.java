package com.example.tasks.auth;

import com.example.tasks.auth.dto.AuthRequest;
import com.example.tasks.auth.dto.AuthResponse;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {

    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final JwtService jwt;

    public AuthService(UserRepository users, PasswordEncoder encoder, JwtService jwt) {
        this.users = users;
        this.encoder = encoder;
        this.jwt = jwt;
    }

    public AuthResponse register(AuthRequest r) {
        if (users.existsByUsername(r.username())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Usuário já existe");
        }
        users.save(new AppUser(r.username(), encoder.encode(r.password())));
        return new AuthResponse(jwt.generate(r.username()), r.username());
    }

    public AuthResponse login(AuthRequest r) {
        AppUser user = users.findByUsername(r.username())
                .filter(u -> encoder.matches(r.password(), u.getPassword()))
                .orElseThrow(() -> new BadCredentialsException("Credenciais inválidas"));
        return new AuthResponse(jwt.generate(user.getUsername()), user.getUsername());
    }
}
