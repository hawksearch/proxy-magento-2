<?php
/**
 *  Copyright (c) 2020 Hawksearch (www.hawksearch.com) - All Rights Reserved
 *
 *  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 *  FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 *  IN THE SOFTWARE.
 */
declare(strict_types=1);

namespace HawkSearch\Proxy\Gateway\Response;

use HawkSearch\Connector\Gateway\Helper\HttpResponseReader;
use HawkSearch\Connector\Gateway\Http\ClientInterface;
use HawkSearch\Connector\Gateway\Http\Converter\JsonToArray;
use HawkSearch\Connector\Gateway\Response\HandlerInterface;
use HawkSearch\Proxy\Api\Data\SearchResultDataInterface;

class SearchResultHandler implements HandlerInterface
{
    /**
     * @var HttpResponseReader
     */
    private $httpResponseReader;

    /**
     * @var JsonToArray
     */
    private $converter;

    /**
     * SearchResultHandler constructor.
     * @param HttpResponseReader $httpResponseReader
     * @param JsonToArray $converter
     */
    public function __construct(
        HttpResponseReader $httpResponseReader,
        JsonToArray $converter
    ) {
        $this->httpResponseReader = $httpResponseReader;
        $this->converter = $converter;
    }

    /**
     * Handles response
     *
     * @param array $handlingSubject
     * @param array $response
     * @return array
     */
    public function handle(array $handlingSubject, array $response)
    {
        $responseData = $this->httpResponseReader->readResponseData($response);
        if ($responseData === '') {
            $responseData = [];
        }

        //deserialize values
        if (isset($responseData['Data'][SearchResultDataInterface::RESULTS])) {
            $responseData['Data'][SearchResultDataInterface::RESULTS] = $this->processString(
                $responseData['Data'][SearchResultDataInterface::RESULTS]
            );
        }

        if (isset($responseData['Data'][SearchResultDataInterface::FEATURED_ITEMS])) {
            $responseData['Data'][SearchResultDataInterface::FEATURED_ITEMS] = $this->processString(
                $responseData['Data'][SearchResultDataInterface::FEATURED_ITEMS]
            );
        }

        $response[ClientInterface::RESPONSE_DATA] = $responseData;

        return $response;
    }

    /**
     * Convert Json string to array
     * @param string $string
     * @return array
     */
    private function processString(string $string) : array
    {
        try {
            $result = ($string !== null) ? $this->converter->convert($string) : [];
        } catch (\InvalidArgumentException $e) {
            $result = [];
        }

        return $result;
    }
}
