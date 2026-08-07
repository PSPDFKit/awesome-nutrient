# syntax=docker/dockerfile:1

# The SDK pins to 10.0 to match the Nutrient sample Dockerfile.
ARG DOTNET_VERSION=10.0

# ---------------------------------------------------------------- web sdk
# The Nutrient Web SDK ships ~148 MB of WASM and font resources that must be served
# alongside the app, so it's fetched here rather than committed. Its own stage keeps
# Node out of the runtime image and lets the layer cache on package.json alone.
FROM node:22-slim AS websdk
WORKDIR /websdk

COPY package.json package-lock.json* ./
COPY scripts/ ./scripts/
# The postinstall copy step targets src/…/wwwroot, so that path has to exist here.
RUN mkdir -p src/NutrientOfficeTemplating/wwwroot/vendor \
    && npm install --omit=dev --no-audit --no-fund

# ------------------------------------------------------------------ build
FROM mcr.microsoft.com/dotnet/sdk:${DOTNET_VERSION} AS build
WORKDIR /src

# Restore first so the layer caches independently of source changes.
COPY src/NutrientOfficeTemplating/NutrientOfficeTemplating.csproj ./NutrientOfficeTemplating/
RUN dotnet restore ./NutrientOfficeTemplating/NutrientOfficeTemplating.csproj

COPY src/NutrientOfficeTemplating/ ./NutrientOfficeTemplating/
RUN dotnet publish ./NutrientOfficeTemplating/NutrientOfficeTemplating.csproj \
      -c Release -o /app --no-restore

# Dropped in after publish: `dotnet publish` would otherwise have to walk 148 MB of
# static assets on every build.
COPY --from=websdk /websdk/src/NutrientOfficeTemplating/wwwroot/vendor/nutrient/ \
     /app/wwwroot/vendor/nutrient/

# ---------------------------------------------------------------- runtime
FROM mcr.microsoft.com/dotnet/aspnet:${DOTNET_VERSION} AS runtime
WORKDIR /app

# Microsoft core fonts are REQUIRED, not cosmetic: the Office templates use
# Calibri/Arial metrics, and without these fonts the Office-to-PDF conversion
# substitutes faces and the output reflows. fontconfig is what actually resolves
# them at render time.
#
# ttf-mscorefonts-installer lives in contrib/non-free and prompts for EULA
# acceptance, so both are configured before the install.
RUN set -eux; \
    sed -i 's/ main$/ main contrib non-free/' /etc/apt/sources.list.d/debian.sources 2>/dev/null \
      || sed -i 's/main$/main contrib non-free/' /etc/apt/sources.list; \
    echo "ttf-mscorefonts-installer msttcorefonts/accepted-mscorefonts-eula select true" \
      | debconf-set-selections; \
    apt-get update; \
    DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
      ca-certificates \
      fontconfig \
      libgdiplus \
      locales \
      ttf-mscorefonts-installer; \
    fc-cache -f; \
    sed -i 's/^# *en_US.UTF-8 UTF-8/en_US.UTF-8 UTF-8/' /etc/locale.gen; \
    locale-gen en_US.UTF-8; \
    rm -rf /var/lib/apt/lists/*

ENV LANG=en_US.UTF-8 \
    LC_ALL=en_US.UTF-8 \
    DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=false \
    ASPNETCORE_URLS=http://+:8080

# Licence keys are supplied at runtime, never baked in:
#   NUTRIENT_LICENSE_KEY      — .NET SDK, server-side. Without it, generated documents
#                               carry an evaluation watermark.
#   NUTRIENT_WEB_LICENSE_KEY  — Web SDK, served to the browser via /api/config. Without
#                               it the viewer runs in time-limited trial mode.
# Set both with `fly secrets set`. The Web SDK key is inherently public once served —
# that is how a client-side SDK works — but keeping it in a secret means it is absent
# from the repo and the image, and one image runs in every environment.

COPY --from=build /app ./

EXPOSE 8080
ENTRYPOINT ["dotnet", "NutrientOfficeTemplating.dll"]
