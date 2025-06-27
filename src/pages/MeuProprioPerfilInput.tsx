
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { useState } from "react";

const MeuProprioPerfilInput = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      // Store the username in sessionStorage for the flow
      sessionStorage.setItem('instagram_username', username.trim());
      navigate('/meu-proprio-perfil-loading');
    }
  };

  return (
    <div className="min-h-screen bg-gray-200 flex flex-col">
      {/* Progress bar at top */}
      <div className="w-full px-4 pt-4">
        <Progress value={20} className="h-2" />
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-lg">
          {/* Central icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center">
              <div className="text-white text-2xl">
                🕵️
              </div>
            </div>
          </div>

          {/* Main title */}
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">
            Descubra agora
          </h1>

          {/* Subtitle */}
          <p className="text-center text-gray-600 mb-8">
            Quem está falando de você no instagram.
          </p>

          {/* Input label */}
          <p className="text-center text-gray-700 mb-4 font-medium">
            Digite seu instagram abaixo:
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Input field */}
            <div className="mb-2">
              <Input
                placeholder="@afelopes"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full text-center border-gray-300 rounded-lg py-3"
              />
            </div>

            {/* Security text */}
            <div className="flex items-center justify-center mb-6">
              <span className="text-xs text-gray-500 flex items-center">
                🔒 Dados seguros, não é necessário sua senha
              </span>
            </div>

            {/* Submit button */}
            <Button 
              type="submit" 
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 rounded-xl mb-4"
              disabled={!username.trim()}
            >
              Continuar
            </Button>
          </form>

          {/* Warning block */}
          <div className="bg-orange-500 text-white rounded-lg p-4 mb-8 flex items-center">
            <span className="text-lg mr-2">⚠️</span>
            <div>
              <div className="font-semibold">Atenção</div>
              <div className="text-sm">Limite de apenas 1 PESQUISA por dispositivo</div>
            </div>
          </div>

          {/* Feedbacks section */}
          <h2 className="text-xl font-bold text-center text-gray-800 mb-6">
            FeedBacks
          </h2>

          {/* Feedback cards */}
          <div className="space-y-4">
            {/* First feedback */}
            <Card className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage src="/placeholder.svg" alt="Geovana" />
                  <AvatarFallback>G</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-semibold text-gray-800">Geovana</span>
                    <span className="text-gray-500 text-sm">@geo_vaninha</span>
                    <span className="text-gray-400 text-xs">1min</span>
                  </div>
                  <p className="text-gray-700 text-sm">
                    Que meu ex via meu perfil todo dia eu já sabia kakaka que o fã de lá jó pra ver certeza mon kkk
                  </p>
                </div>
              </div>
            </Card>

            {/* Second feedback */}
            <Card className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage src="/placeholder.svg" alt="Luiz" />
                  <AvatarFallback>L</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-semibold text-gray-800">Luiz</span>
                    <span className="text-gray-500 text-sm">@aatualizeiro</span>
                    <span className="text-gray-400 text-xs">4min</span>
                  </div>
                  <p className="text-gray-700 text-sm">
                    Acho que é dois por instagram tirar esse app do ar akkkkkkk O bagui vê todas as informações mesmo vei.... Bizarro descobrir altas fitas
                  </p>
                </div>
              </div>
            </Card>

            {/* Third feedback */}
            <Card className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage src="/placeholder.svg" alt="Luzianne" />
                  <AvatarFallback>L</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-semibold text-gray-800">Luzianne</span>
                    <span className="text-gray-500 text-sm">@andreaturqueza</span>
                    <span className="text-gray-400 text-xs">7min</span>
                  </div>
                  <p className="text-gray-700 text-sm">
                    Eu jurava que era golpe gente KKKK Mas por aqui deu certo sim! Recebi meu relatório segundos depois de finalizar o pagamento.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Bottom navigation */}
      <div className="bg-white border-t border-gray-200 px-4 py-3">
        <div className="flex justify-around items-center max-w-md mx-auto">
          <div className="flex flex-col items-center">
            <div className="w-6 h-6 mb-1 text-gray-400">
              📊
            </div>
            <span className="text-xs text-gray-400">Painel</span>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="w-6 h-6 mb-1 text-orange-500">
              🔍
            </div>
            <span className="text-xs text-orange-500 font-medium">Espionar</span>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="w-6 h-6 mb-1 text-gray-400">
              🖼️
            </div>
            <span className="text-xs text-gray-400">Prints</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeuProprioPerfilInput;
