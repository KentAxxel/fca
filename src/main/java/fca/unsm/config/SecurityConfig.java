package fca.unsm.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.session.SessionRegistry;
import org.springframework.security.core.session.SessionRegistryImpl;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.session.HttpSessionEventPublisher;

import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

        private final CustomAuthenticationFailureHandler failureHandler;
        private final CustomAuthenticationSuccessHandler successHandler;
        private final UsuarioDetailsService usuarioDetailsService;

        public SecurityConfig(
                        CustomAuthenticationFailureHandler failureHandler,
                        CustomAuthenticationSuccessHandler successHandler,
                        UsuarioDetailsService usuarioDetailsService) {
                this.failureHandler = failureHandler;
                this.successHandler = successHandler;
                this.usuarioDetailsService = usuarioDetailsService;
        }

        @Bean
        public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
                http
                                .authenticationProvider(authenticationProvider())
                                .authorizeHttpRequests(auth -> auth
                                                .requestMatchers(
                                                                "/",
                                                                "/fca/inicio",
                                                                "/fca/login",

                                                                "/fca/autoridades",
                                                                "/fca/autoridades/**",

                                                                "/fca/noticias",
                                                                "/fca/noticias/**",

                                                                "/fca/eventos",
                                                                "/fca/eventos/**",

                                                                "/fca/laboratorios",
                                                                "/fca/laboratorios/**",

                                                                "/fca/comisiones",
                                                                "/fca/comisiones/**",

                                                                "/fca/bolsa-laboral",
                                                                "/fca/bolsa-laboral/**",

                                                                "/fca/empresas",
                                                                "/fca/empresas/**",

                                                                "/fca/registro",
                                                                "/fca/espera-confirmacion",
                                                                "/fca/acceso-denegado",

                                                                "/css/**",
                                                                "/js/**",
                                                                "/images/**",
                                                                "/uploads/**",
                                                                "/ws/**")
                                                .permitAll()

                                                .requestMatchers(HttpMethod.POST, "/api/usuarios/registro-publico")
                                                .permitAll()
                                                .requestMatchers(HttpMethod.PUT, "/api/perfil/cambiar-contrasena")
                                                .authenticated()

                                                .requestMatchers(HttpMethod.GET,
                                                                "/api/autoridades",
                                                                "/api/noticias",
                                                                "/api/eventos",
                                                                "/api/laboratorios",
                                                                "/api/comisiones",
                                                                "/api/ofertas",
                                                                "/api/empresas")
                                                .permitAll()
                                                
                                                .requestMatchers("/api/session/close-tab").authenticated()

                                                .requestMatchers(
                                                                "/fca/admin/usuarios",
                                                                "/api/usuarios/**",
                                                                "/api/roles/**")
                                                .hasRole("ADMIN")

                                                .requestMatchers(
                                                                "/fca/admin/**",
                                                                "/api/**")
                                                .hasAnyRole("ADMIN", "AUTOR")

                                                .anyRequest().authenticated())
                                .formLogin(form -> form
                                                .loginPage("/fca/login")
                                                .loginProcessingUrl("/fca/login")
                                                .usernameParameter("username")
                                                .passwordParameter("password")
                                                .failureHandler(failureHandler)
                                                .successHandler(successHandler)
                                                .permitAll())
                                .sessionManagement(session -> session
                                                .invalidSessionUrl("/fca/login?expired=true")
                                                .maximumSessions(1)
                                                .maxSessionsPreventsLogin(true)
                                                .expiredUrl("/fca/login?expired=true")
                                                .sessionRegistry(sessionRegistry()))
                                .exceptionHandling(ex -> ex
                                                .accessDeniedPage("/fca/acceso-denegado"))
                                .logout(logout -> logout
                                                .logoutUrl("/logout")
                                                .logoutSuccessUrl("/fca/inicio")
                                                .invalidateHttpSession(true)
                                                .clearAuthentication(true)
                                                .deleteCookies("JSESSIONID"))
                                .headers(headers -> headers
                                                .cacheControl(cache -> {
                                                }));

                return http.build();
        }

        @Bean
        public AuthenticationProvider authenticationProvider() {
                DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
                provider.setUserDetailsService(usuarioDetailsService);
                provider.setPasswordEncoder(passwordEncoder());
                return provider;
        }

        @Bean
        public SessionRegistry sessionRegistry() {
                return new SessionRegistryImpl();
        }

        @Bean
        public HttpSessionEventPublisher httpSessionEventPublisher() {
                return new HttpSessionEventPublisher();
        }

        @Bean
        public PasswordEncoder passwordEncoder() {
                return new BCryptPasswordEncoder();
        }
}