<?php
/**
 * Copyright (c) 2023 Hawksearch (www.hawksearch.com) - All Rights Reserved
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 */
declare(strict_types=1);

namespace HawkSearch\Proxy\Logger;

use Magento\Framework\ObjectManagerInterface;
use HawkSearch\Proxy\Model\Config\General as GeneralConfigProvider;
use Psr\Log\LoggerInterface;
use Psr\Log\NullLogger;

class LoggerFactory
{
    /**
     * @var ObjectManagerInterface
     */
    private $objectManager;

    /**
     * @var GeneralConfigProvider
     */
    private $generalConfigProvider;

    /**
     * @var string
     */
    private $instanceName;

    /**
     * LoggerFactory constructor.
     *
     * @param objectManagerInterface $objectManager
     * @param GeneralConfigProvider $generalConfigProvider
     * @param string $instanceName
     */
    public function __construct(
        ObjectManagerInterface $objectManager,
        GeneralConfigProvider $generalConfigProvider,
        string $instanceName = '\\Psr\\Log\\LoggerInterface'
    ) {
        $this->objectManager = $objectManager;
        $this->generalConfigProvider = $generalConfigProvider;
        $this->instanceName = $instanceName;
    }

    /**
     * Create logger instance
     *
     * @return LoggerInterface
     */
    public function create()
    {
        if (!$this->generalConfigProvider->isLoggingEnabled()) {
            return $this->objectManager->get(NullLogger::class);
        }

        $object = $this->objectManager->get($this->instanceName);

        if (!($object instanceof LoggerInterface)) {
            throw new \InvalidArgumentException(
                sprintf(
                    '%s constructor expects the $instanceName to implement %s; received %s',
                    self::class,
                    LoggerInterface::class,
                    get_class($object)
                )
            );
        }

        return $object;
    }
}
